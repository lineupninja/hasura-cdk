import * as AWS from 'aws-sdk';
import { readFileSync } from 'fs';
/**
 * Configure the AWS region
 */

const region = process.env.AWS_REGION;
if (!region) {
    throw Error('AWS_REGION must be defined in environment');
}
AWS.config.update({ region });

const appName = process.env.APP_NAME;
if (!appName) {
    throw Error('APP_NAME must be defined in environment');
}

const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;
if (!hasuraAdminSecret) {
    throw Error('HASURA_ADMIN_SECRET must be defined in environment');
}

const hasuraJwtSecret = process.env.HASURA_JWT_SECRET;
if (!hasuraJwtSecret) {
    throw Error('HASURA_JWT_SECRET must be defined in environment');
}

async function setDatabaseConnectionUrl(): Promise<void> {

    const cdkOutputsData = JSON.parse(readFileSync('cdk.outputs.json', 'utf-8'));

    const masterSecretArn = cdkOutputsData[`${appName}-HasuraStack`].HasuraDatabaseMasterSecretArn;

    const secretsmanager = new AWS.SecretsManager({ apiVersion: '2017-10-17' });

    const getMasterSecretParams: AWS.SecretsManager.GetSecretValueRequest = {
        SecretId: masterSecretArn,
    };

    const masterSecret = await secretsmanager.getSecretValue(getMasterSecretParams).promise();
    if (!masterSecret.SecretString) {
        throw Error('Did not get SecretString');
    }
    const connectionDetails = JSON.parse(masterSecret.SecretString) as {
        username: string;
        password: string;
        dbname: string;
        engine: string;
        host: string;
        port: string;
    };

    const password = encodeURIComponent(connectionDetails.password);

    const connectionString = `postgres://${connectionDetails.username}:${password}@${connectionDetails.host}:${connectionDetails.port}/${connectionDetails.dbname}`;

    const databaseUrlSecretArn = cdkOutputsData[`${appName}-HasuraStack`].HasuraDatabaseUrlSecretArn;

    console.log('Setting Database Connection');
    const putDatabaseConnectionUrl: AWS.SecretsManager.PutSecretValueRequest = {
        SecretId: databaseUrlSecretArn,
        SecretString: connectionString,
    };
    await secretsmanager.putSecretValue(putDatabaseConnectionUrl).promise();

    console.log('Setting admin secret');
    const hasuraAdminSecretArn = cdkOutputsData[`${appName}-HasuraStack`].HasuraAdminSecretArn;

    const putHasuraAdminSecret: AWS.SecretsManager.PutSecretValueRequest = {
        SecretId: hasuraAdminSecretArn,
        SecretString: hasuraAdminSecret,
    };
    await secretsmanager.putSecretValue(putHasuraAdminSecret).promise();

    console.log('Setting JWT secret');
    const hasuraJwtSecretArn = cdkOutputsData[`${appName}-HasuraStack`].HasuraJwtSecretArn;

    const putHasuraJwtSecret: AWS.SecretsManager.PutSecretValueRequest = {
        SecretId: hasuraJwtSecretArn,
        SecretString: hasuraJwtSecret,
    };
    await secretsmanager.putSecretValue(putHasuraJwtSecret).promise();

}

/**
 * Perform actions required after to the execution of the CDK stack
 */

async function main(): Promise<void> {

    await setDatabaseConnectionUrl();
}


main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
