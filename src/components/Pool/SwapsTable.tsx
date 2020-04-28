import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { formatDate } from '../../utils/helpers';

interface Props {
    poolAddress: string;
}

const swaps = [
    {
        timestamp: 1586209125,
        tokenAmountIn: '0.358407300853380256',
        tokenAmountOut: '0.703251204413357301',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587092550,
        tokenAmountIn: '1.630813954678442357',
        tokenAmountOut: '0.948769730768138054',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586974294,
        tokenAmountIn: '1.917102018633800155',
        tokenAmountOut: '3.516728833993792025',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587405774,
        tokenAmountIn: '4.334204502455957822',
        tokenAmountOut: '7.683752918920405063',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586495414,
        tokenAmountIn: '0.291602300309164513',
        tokenAmountOut: '0.157634936618253245',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585163871,
        tokenAmountIn: '1.896409678409616231',
        tokenAmountOut: '0.937685486998113654',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585768619,
        tokenAmountIn: '0.642964503519159257',
        tokenAmountOut: '0.292376093066256013',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587524821,
        tokenAmountIn: '1.5643362454876218',
        tokenAmountOut: '2.784558518249565133',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585170936,
        tokenAmountIn: '0.563000796445273021',
        tokenAmountOut: '1.144098676003816176',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1588048040,
        tokenAmountIn: '5.582029364208308621',
        tokenAmountOut: '3.220546672338239347',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586884724,
        tokenAmountIn: '1.834935508906827115',
        tokenAmountOut: '3.462935388585790566',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586141596,
        tokenAmountIn: '2.153894524754675456',
        tokenAmountOut: '4.321364462260768462',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585490673,
        tokenAmountIn: '0.21273157887407516',
        tokenAmountOut: '0.497800015704214094',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587263190,
        tokenAmountIn: '1.179080973020935168',
        tokenAmountOut: '2.016654581445682355',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585725383,
        tokenAmountIn: '0.418508988843674488',
        tokenAmountOut: '0.193115116348122992',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586954834,
        tokenAmountIn: '0.292233565617750727',
        tokenAmountOut: '0.163874590140435978',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587790042,
        tokenAmountIn: '1.564685052746839041',
        tokenAmountOut: '2.757950734620904472',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586141676,
        tokenAmountIn: '0.294907648376759312',
        tokenAmountOut: '0.148679501185669016',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587037434,
        tokenAmountIn: '3.4338919200435611',
        tokenAmountOut: '5.835306401809161954',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586281991,
        tokenAmountIn: '0.755402485130020916',
        tokenAmountOut: '0.392545811834114342',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586887858,
        tokenAmountIn: '1.86766774514768507',
        tokenAmountOut: '3.465536329591134413',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586660896,
        tokenAmountIn: '0.830759046166183766',
        tokenAmountOut: '0.437623972085317823',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587029378,
        tokenAmountIn: '10.342817322323103075',
        tokenAmountOut: '6.400818650956866803',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586001996,
        tokenAmountIn: '1.158628074851593553',
        tokenAmountOut: '0.541946525929800624',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587218103,
        tokenAmountIn: '1.621587989446593169',
        tokenAmountOut: '2.726216176757890232',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585493624,
        tokenAmountIn: '0.147013137431633005',
        tokenAmountOut: '0.339257610024969551',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585761258,
        tokenAmountIn: '1.827105280708869831',
        tokenAmountOut: '0.854562031241182923',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586957810,
        tokenAmountIn: '3.505004907864304392',
        tokenAmountOut: '1.930681447187138058',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586181419,
        tokenAmountIn: '0.369018749978194199',
        tokenAmountOut: '0.752109094308053643',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587250885,
        tokenAmountIn: '1.841321984345209705',
        tokenAmountOut: '1.09871896490123899',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586841312,
        tokenAmountIn: '20.234871173611037835',
        tokenAmountOut: '37.695090976031790317',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586887144,
        tokenAmountIn: '5.693391297176737895',
        tokenAmountOut: '10.584821713649841047',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587781016,
        tokenAmountIn: '2.101034775301444482',
        tokenAmountOut: '3.763188200979595441',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587317281,
        tokenAmountIn: '1.464332184389694249',
        tokenAmountOut: '2.567128741388710208',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1584996238,
        tokenAmountIn: '0.158473923644098934',
        tokenAmountOut: '0.317391445870613268',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587177839,
        tokenAmountIn: '0.99670112993074408',
        tokenAmountOut: '1.711946293455104935',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586755385,
        tokenAmountIn: '4.007649987443360388',
        tokenAmountOut: '2.191075007196806388',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585260392,
        tokenAmountIn: '0.189922158654485385',
        tokenAmountOut: '0.454852511504338249',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585612374,
        tokenAmountIn: '0.014766318279262438',
        tokenAmountOut: '0.006651522259962187',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587277127,
        tokenAmountIn: '0.755402485130020917',
        tokenAmountOut: '0.433800284682852793',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587861969,
        tokenAmountIn: '2.079617748358116766',
        tokenAmountOut: '1.245354231381740565',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587303663,
        tokenAmountIn: '2.894722441386874015',
        tokenAmountOut: '1.652499823988965775',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587032311,
        tokenAmountIn: '3.185769643554039296',
        tokenAmountOut: '2.000582911801425384',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586012350,
        tokenAmountIn: '0.299700007583547407',
        tokenAmountOut: '0.647080710157938903',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587648241,
        tokenAmountIn: '1.102530577833316894',
        tokenAmountOut: '1.979222692163698268',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1584562650,
        tokenAmountIn: '0.010140838773198817',
        tokenAmountOut: '0.006664878550537387',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587412528,
        tokenAmountIn: '4.698782385989877778',
        tokenAmountOut: '2.692181331656945697',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586176132,
        tokenAmountIn: '0.586496980121605307',
        tokenAmountOut: '1.209524292174677808',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586534846,
        tokenAmountIn: '0.899987154851079504',
        tokenAmountOut: '0.477413285124709767',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587805178,
        tokenAmountIn: '2.2852024448201144',
        tokenAmountOut: '1.347490344759117122',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586485570,
        tokenAmountIn: '0.366738502667188742',
        tokenAmountOut: '0.705683398104059567',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587814620,
        tokenAmountIn: '3.563199647244150296',
        tokenAmountOut: '2.076569418190395111',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585760574,
        tokenAmountIn: '0.602075220699034162',
        tokenAmountOut: '1.259280138595193052',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587410637,
        tokenAmountIn: '0.891131088600000128',
        tokenAmountOut: '0.502681952910117227',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587038715,
        tokenAmountIn: '9.243567520140280917',
        tokenAmountOut: '5.361883798551352418',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586908330,
        tokenAmountIn: '1',
        tokenAmountOut: '1.825850514480678647',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586878897,
        tokenAmountIn: '5.061265469017735434',
        tokenAmountOut: '2.695365708262103788',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587244990,
        tokenAmountIn: '2.832847243425749366',
        tokenAmountOut: '4.839126033973165382',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587410925,
        tokenAmountIn: '5.758234058616690688',
        tokenAmountOut: '10.224948250072580364',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586878779,
        tokenAmountIn: '7.452284111713112064',
        tokenAmountOut: '4.001906313473389798',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585710549,
        tokenAmountIn: '0.006964911825576473',
        tokenAmountOut: '0.003100831849921839',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585434930,
        tokenAmountIn: '0.305611402036345039',
        tokenAmountOut: '0.718052627834986537',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586671459,
        tokenAmountIn: '0.414880765775647141',
        tokenAmountOut: '0.784500070563936087',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585923557,
        tokenAmountIn: '0.29056857333183078',
        tokenAmountOut: '0.632996025100462059',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586513336,
        tokenAmountIn: '0.932076147959182517',
        tokenAmountOut: '0.502721745374443573',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586133695,
        tokenAmountIn: '0.348871547340853485',
        tokenAmountOut: '0.169133232855842031',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586878675,
        tokenAmountIn: '2.265782658576037536',
        tokenAmountOut: '1.231016601018394595',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587608894,
        tokenAmountIn: '2.681391906764842164',
        tokenAmountOut: '1.497959342437334037',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587942791,
        tokenAmountIn: '0.822105532580571798',
        tokenAmountOut: '0.469338989867885966',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587800700,
        tokenAmountIn: '2.282488843032345136',
        tokenAmountOut: '1.349893378321945609',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1588014194,
        tokenAmountIn: '2.19737997519359617',
        tokenAmountOut: '3.7828503523413075',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585428448,
        tokenAmountIn: '0.35166573643647196',
        tokenAmountOut: '0.835118574033371014',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587166371,
        tokenAmountIn: '3.39111040998464447',
        tokenAmountOut: '5.852973511470720325',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587269556,
        tokenAmountIn: '7.891577809611106118',
        tokenAmountOut: '4.485026070682578186',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587037172,
        tokenAmountIn: '13.585081226067451904',
        tokenAmountOut: '8.004021299916945865',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587523524,
        tokenAmountIn: '3.245827801192442613',
        tokenAmountOut: '5.808763293647723706',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587480641,
        tokenAmountIn: '3.830090176250055606',
        tokenAmountOut: '6.877638527870201969',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587464233,
        tokenAmountIn: '11.524590459245474202',
        tokenAmountOut: '6.521061142692379332',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586789916,
        tokenAmountIn: '1.144626395747964416',
        tokenAmountOut: '0.608340642050600492',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586904351,
        tokenAmountIn: '0.639483354465720231',
        tokenAmountOut: '1.162934919351581969',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586735855,
        tokenAmountIn: '0.263598942101906241',
        tokenAmountOut: '0.145713726018916846',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585922594,
        tokenAmountIn: '0.642126521683815398',
        tokenAmountOut: '0.297369563838286267',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1588075288,
        tokenAmountIn: '2.03800893566648832',
        tokenAmountOut: '3.518613300579654482',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587790042,
        tokenAmountIn: '1.565479007315011923',
        tokenAmountOut: '2.768957725331954024',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1585262952,
        tokenAmountIn: '0.131816468205412369',
        tokenAmountOut: '0.318673757817669762',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586994294,
        tokenAmountIn: '1.466515993606770814',
        tokenAmountOut: '0.799165097952578048',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587032279,
        tokenAmountIn: '9.394064253017704448',
        tokenAmountOut: '6.003455899368469978',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587060762,
        tokenAmountIn: '3',
        tokenAmountOut: '5.071948583798748869',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1587007272,
        tokenAmountIn: '1.847039661018685184',
        tokenAmountOut: '1.000234427624279369',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585764301,
        tokenAmountIn: '0.732747292440779814',
        tokenAmountOut: '0.344460101065505614',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587489066,
        tokenAmountIn: '1.577117874293967751',
        tokenAmountOut: '0.877665183165632625',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1585141906,
        tokenAmountIn: '0.365303351654641617',
        tokenAmountOut: '0.726022478892234823',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586186837,
        tokenAmountIn: '0.933338678576354945',
        tokenAmountOut: '0.463744331379262059',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587807111,
        tokenAmountIn: '2.3744362554',
        tokenAmountOut: '1.395882055279740797',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587136325,
        tokenAmountIn: '2.689051771623654778',
        tokenAmountOut: '1.559947822439348601',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1586452981,
        tokenAmountIn: '1.320685607966794941',
        tokenAmountOut: '0.695777004668898699',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587269784,
        tokenAmountIn: '1.400368392308964155',
        tokenAmountOut: '2.446472868528619099',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
    {
        timestamp: 1586892542,
        tokenAmountIn: '3.814449584276224791',
        tokenAmountOut: '2.024681898439805275',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587230869,
        tokenAmountIn: '4.638256020172763981',
        tokenAmountOut: '2.728596535131346511',
        tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenInSym: 'WETH',
        tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenOutSym: 'MKR',
    },
    {
        timestamp: 1587403539,
        tokenAmountIn: '7.735377605919265904',
        tokenAmountOut: '13.64692126881357733',
        tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        tokenInSym: 'MKR',
        tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        tokenOutSym: 'WETH',
    },
];

/*
        timestamp
        tokenIn
        tokenInSym
        tokenAmountIn
        tokenOut
        tokenOutSym
        tokenAmountOut
        */

/*
            {swaps.map((swap, index) => {
                return (
                    <TableRow key={swap.timestamp}>
                        <TableCell>
                          {swap.timestamp}
                        </TableCell>

                        <TableCell>
                            {swap.tokenAmountIn swap.tokenInSym}
                        </TableCell>
                        <TableCell>
                            {swap.tokenAmountOut swap.tokenOutSym}
                        </TableCell>
                    </TableRow>
                );
            })
          }
          */
const Wrapper = styled.div`
    width: 100%;
    padding-top: 8px;
`;

const TableWrapper = styled.div`
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    border-bottom: 1px solid var(--panel-border);
    :last-of-type {
        border-bottom: none;
    }
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '33.33%'};
`;

const SwapsTable = observer((props: Props) => {
    const renderSwapsTable = swaps => {
        return (
            <React.Fragment>
                {swaps.map((swap, index) => {
                    return (
                        <TableRow key={swap.timestamp}>
                            <TableCell>{formatDate(swap.timestamp)}</TableCell>
                            <TableCell>
                                {swap.tokenAmountIn} {swap.tokenInSym}
                            </TableCell>
                            <TableCell>
                                {swap.tokenAmountOut} {swap.tokenOutSym}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <TableWrapper>
                <HeaderRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Token In</TableCell>
                    <TableCell>Token Out</TableCell>
                </HeaderRow>
                {renderSwapsTable(swaps)}
            </TableWrapper>
        </Wrapper>
    );
});

export default SwapsTable;
