/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

interface Asset {
    ID: string;
    FechaCosecha: string;
    FechaRecoleccion: string;
    LugarCosecha: string;
    VariedadFruta: string;
    SesionesRiego: number;
    SesionesAbonado: number;
    Fertilizantes: string;
    Plaguicidas: string;
    Peso: number;
    ClienteDestino: string;
    Agricultor: string;
    docType?: string;
}

@Info({ title: 'AssetTransfer', description: 'Smart contract for trading assets' })
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                ID: 'asset1',
                FechaCosecha: '2024-05-10',
                FechaRecoleccion: '2024-05-15',
                LugarCosecha: 'Finca A',
                VariedadFruta: 'Manzana',
                SesionesRiego: 5,
                SesionesAbonado: 2,
                Fertilizantes: 'FertA',
                Plaguicidas: 'PlagA',
                Peso: 100,
                ClienteDestino: 'Distribuidor XYZ',
                Agricultor: 'Agricultor1'
            },
            {
                ID: 'asset2',
                FechaCosecha: '2024-05-11',
                FechaRecoleccion: '2024-05-16',
                LugarCosecha: 'Finca B',
                VariedadFruta: 'Naranja',
                SesionesRiego: 3,
                SesionesAbonado: 1,
                Fertilizantes: 'FertC',
                Plaguicidas: 'PlagC',
                Peso: 80,
                ClienteDestino: 'Distribuidor ABC',
                Agricultor: 'Agricultor2'
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    @Transaction()
    public async CreateAsset(ctx: Context, id: string, fechaCosecha: string, fechaRecoleccion: string, lugarCosecha: string, 
        variedadFruta: string, sesionesRiego: number, sesionesAbonado: number, fertilizantes: string, plaguicidas: string, 
        peso: number, clienteDestino: string, agricultor: string, docType: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset: Asset = {
            ID: id,
            FechaCosecha: fechaCosecha,
            FechaRecoleccion: fechaRecoleccion,
            LugarCosecha: lugarCosecha,
            VariedadFruta: variedadFruta,
            SesionesRiego: sesionesRiego,
            SesionesAbonado: sesionesAbonado,
            Fertilizantes: fertilizantes,
            Plaguicidas: plaguicidas,
            Peso: peso,
            ClienteDestino: clienteDestino,
            Agricultor: agricultor
        };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    @Transaction()
    public async UpdateAsset(ctx: Context, id: string, fechaCosecha: string, fechaRecoleccion: string, lugarCosecha: string, 
        variedadFruta: string, sesionesRiego: number, sesionesAbonado: number, fertilizantes: string, plaguicidas: string, 
        peso: number, clienteDestino: string, agricultor: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const updatedAsset: Asset = {
            ID: id,
            FechaCosecha: fechaCosecha,
            FechaRecoleccion: fechaRecoleccion,
            LugarCosecha: lugarCosecha,
            VariedadFruta: variedadFruta,
            SesionesRiego: sesionesRiego,
            SesionesAbonado: sesionesAbonado,
            Fertilizantes: fertilizantes,
            Plaguicidas: plaguicidas,
            Peso: peso,
            ClienteDestino: clienteDestino,
            Agricultor: agricultor
        };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<string> {
        const assetString = await this.ReadAsset(ctx, id);
        const asset: Asset = JSON.parse(assetString);
        const oldOwner = asset.ClienteDestino;
        asset.ClienteDestino = newOwner;
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
