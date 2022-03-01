import { axios2 as Axios } from "../../axios/index.js";
import { render } from "./test.mjs";

"use strict";
const axios = new Axios( {
    "baseURL": {
        name: "json",
        url: ""
    }
} );
axios.interceptors.response.use( r => r.json(), e => e, "json" );
const api = await axios.get( "./novel-api.json" ).then( res =>
{
    return res.json();
} );
//搜索小说名称
let name = "超级兵王";
//模拟搜索流程
for ( let { "search-url": search_url } of api )
{
    const search_content = await axios.get( render( search_url, {
        name
    } ) ).then( render => render.json() );
    let { data: { list } } = search_content;
    const novel = await axios.get( "https://api.mianhuatangxs.cn/api/v1/novelsearch?content=超级兵王&pageSize=20&pageIndex=1&bookId=561&type=1", {
        "group": "json"
    } ).then( render => render.data );
    console.log( novel )
    console.log( list[ 0 ] );
}
//@tag
axios.get( 'https://api.mianhuatangxs.cn/api/v1/novelsearch?content=超级兵王&pageIndex=1&pageSize=20&type=1', {
    "group": "json"
} ).then( ( { data } ) =>
{
    const a = data.list.find( (/** @type {{ name: string; }} */ r ) => r.name === "超级兵王" );
    if ( a === undefined )
        console.log( "没有书源" );
    else
        console.log( a );
} );
axios.post( "http://m.mhtwx.la/search.php", {
    body: "searchkey=" + name
} ).then( render =>
{
    console.log( render )
}, error =>
{
    console.warn( error )
} );
