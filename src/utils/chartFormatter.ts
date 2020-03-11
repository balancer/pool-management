import {Pool} from "../types";
import {ContractMetadata} from "../stores/ContractMetadata";

export const formatPoolAssetChartData = (pool: Pool, contractMetadata: ContractMetadata) => {
    const data = getPoolTokenWeights(pool);
    return {
        datasets: [
            {
                data: data,
                borderAlign: 'center',
                backgroundColor: getPoolTokenColors(pool, contractMetadata),
                borderColor: '#282932',
                borderWidth: '1',
            },
        ],
    };
};

const getPoolTokenColors = (pool: Pool, contractMetadata: ContractMetadata): string[] => {
    console.log('getPoolTokenColors');
    return pool.tokens.map(token => {
        const metadata = contractMetadata.tokens.find(metadata => {
            console.log({
                metadata: metadata.address,
                token: token.address,
                color: metadata.chartColor
            })
            return metadata.address === token.address

        });
        return metadata.chartColor
    });
};

const getPoolTokenWeights = (pool: Pool): number[] => {
    return pool.tokens.map(token => {
        return token.denormWeightProportion.times(100).toNumber();
    });
};
