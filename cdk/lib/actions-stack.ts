import { StackProps, Stack, Construct, Duration } from '@aws-cdk/core';
import { Vpc, SubnetType } from '@aws-cdk/aws-ec2';
import { Function, Runtime, Code, FunctionProps } from '@aws-cdk/aws-lambda';
import { CfnAuthorizer, LambdaIntegration, RestApi, MethodLoggingLevel, CfnMethod, AuthorizationType } from '@aws-cdk/aws-apigateway';
import * as route53_targets from '@aws-cdk/aws-route53-targets';
import { PublicHostedZone, ARecord, AddressRecordTarget } from '@aws-cdk/aws-route53';
import * as path from 'path';
import { RetainedLambdaLayerVersion } from './utils/retained-lambda-layer';
import { Certificates } from './certificates-stack';

export interface ActionsStackProps extends StackProps {
    appName: string;
    certificates: Certificates;
    actionsHostname: string;
    hostedZoneId: string;
    hostedZoneName: string;
}

export class ActionsStack extends Stack {


    constructor(scope: Construct, id: string, props: ActionsStackProps) {
        super(scope, id, props);

        const hostedZone = PublicHostedZone.fromHostedZoneAttributes(this, 'HasuraHostedZone', {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.hostedZoneName,
        });

        const api = new RestApi(this, 'ActionsApi', {
            domainName: {
                domainName: props.actionsHostname,
                certificate: props.certificates.actions,
            },
            restApiName: 'Actions',
            description: 'Endpoint For Hasura Actions',
            deployOptions: {
                loggingLevel: MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
            },
        });

        // API DNS record
        new ARecord(this, 'ActionsApiAliasRecord', {
            zone: hostedZone,
            recordName: props.actionsHostname,
            target: AddressRecordTarget.fromAlias(new route53_targets.ApiGateway(api)),
        });

        // Create a lambda layer to contain node_modules
        const handlerDependenciesLayer = new RetainedLambdaLayerVersion(this, 'ActionHandlerDependencies', {
            contentLocation: 'actions/dependencies-layer',
            description: 'Dependencies layer',
            compatibleRuntimes: [Runtime.NODEJS_12_X],
        });

        const actionHandler = new Function(this, 'ActionHandler', {
            functionName: `${props.appName}-ActionHandler`,
            handler: 'handler.handler',
            memorySize: 1024,
            runtime: Runtime.NODEJS_12_X,
            code: Code.fromAsset(path.join(__dirname, '../../actions/dist/')),
            timeout: Duration.seconds(4),
            layers: [handlerDependenciesLayer],
        });

        const handlerResource = api.root.addResource('handler');
        const actionHandlerIntegration = new LambdaIntegration(actionHandler);

        handlerResource.addMethod('POST', actionHandlerIntegration);
        handlerResource.addMethod('GET', actionHandlerIntegration);

    }


}
