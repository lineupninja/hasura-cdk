import { StackProps, Stack, Construct } from '@aws-cdk/core';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { PublicHostedZone } from '@aws-cdk/aws-route53';

export interface CertificatesStackProps extends StackProps {
    hostedZoneId: string;
    hostedZoneName: string;
    hasuraHostname: string;
    actionsHostname: string;
}

export type Certificates = {
    hasura: DnsValidatedCertificate;
    actions: DnsValidatedCertificate;
};

export class CertificatesStack extends Stack {

    readonly certificates: Certificates;

    constructor(scope: Construct, id: string, props: CertificatesStackProps) {
        super(scope, id, props);

        const hostedZone = PublicHostedZone.fromHostedZoneAttributes(this, 'HasuraHostedZone', {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.hostedZoneName,
        });

        const hasura = new DnsValidatedCertificate(this, 'HasuraCertificate', {
            hostedZone,
            domainName: props.hasuraHostname,
        });

        const actions = new DnsValidatedCertificate(this, 'ActionsCertificate', {
            hostedZone,
            domainName: props.actionsHostname,
        });


        this.certificates = {
            hasura,
            actions,
        };

    }
}
