import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
// @ts-ignore - No types available
import { fortune } from 'fortune-teller';

export async function handler(event: APIGatewayEvent, context: unknown): Promise<APIGatewayProxyResult> {
    try {

        console.log(event);

        let fortuneCount = 1;

        if (event.body) {

            const body = JSON.parse(event.body) as {
                session_variables: {
                    'x-hasura-role': string;
                };
                input: {
                    arg1: {
                        count: number;
                    };
                    action: {
                        name: string;
                    };
                };
            };
            fortuneCount = body.input.arg1.count;

        }

        const fortunes: string[] = [];

        for (let i = 0; i < fortuneCount; i++) {
            fortunes.push(fortune());
        }

        return { statusCode: 200, body: JSON.stringify({ fortunes }) };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Something went wrong' };
    }

}
