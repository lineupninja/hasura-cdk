import { StackProps, Stack, Construct } from '@aws-cdk/core';
import { Vpc, SubnetType } from '@aws-cdk/aws-ec2';

export type VPCStackProps = StackProps;

export class VPCStack extends Stack {

    readonly vpc: Vpc;

    constructor(scope: Construct, id: string, props: VPCStackProps) {
        super(scope, id, props);

        const vpc = new Vpc(this, 'hasura-vpc', {
            cidr: '10.0.0.0/16',
            enableDnsHostnames: true,
            enableDnsSupport: true,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Database',
                    subnetType: SubnetType.ISOLATED,
                },
            ],
            natGateways: 0,
            maxAzs: 2,
        });
        this.vpc = vpc;
    }


}
