const r = /{{(.+?)}}|\${(.+?)}/g;
let res;
while ( ( res = r.exec( "{{item}}-{{name}}-${index}" ) ) != null )
{
  console.log( res
  );
}