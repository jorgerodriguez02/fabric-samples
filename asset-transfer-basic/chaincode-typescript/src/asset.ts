/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    olor: string;

    @Property()
    public Size: number;

    @Property()
    public Owner: string;
public docType?: string;

    @Property()
    public ID: string;

    @Property()
    public FechaCosecha: string;

    @Property()
    public FechaRecoleccion: string;

    @Property()
    public LugarCosecha: string;

    @Property()
    public VariedadFruta: string;

    @Property()
    public SesionesRiego: number;

    @Property()
    public SesionesAbonado: number;

    @Property()
    public Fertilizantes: string;

    @Property()
    public Plaguicidas: string;

    @Property()
    public Peso: number;

    @Property()
    public ClienteDestino: string;

    @Property()
    public Agricultor: string;

    @Property()
    public C
    @Property()
    public AppraisedValue: number;
}