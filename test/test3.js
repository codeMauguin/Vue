/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function ( x, n )
{
  if ( n < 0 )
  {
    n = -n;
    x = 1 / x;
  } else if ( n === 0 )
  {
    return 1;
  }

  if ( n > 10000 )
  {
    let l = Math.ceil( n / 2 );
    let r = n - l;
    return myPow( x, l ) * myPow( x, r );
  }

  return calculation( x, x, 0 )
  function calculation ( x, ns, frequency )
  {
    if ( x === 0 )
    {
      return 0;
    }
    if ( frequency < n - 1 )
      return calculation( x * ns, ns, ++frequency );
    else
      return x;
  }
};
console.log( myPow( 0.99999,
  948688 ) );
/**
* @param {number[]} nums
* @return {number}
*/
var longestConsecutive = function ( nums )
{
  let max = nums.length > 0 ? 1 : 0;
  //存储结果集，下次遍历不会判断,但事实上找到连续后就删除元素更可行
  let map = {};
  // 去重复会使无用的遍历减少-不能去重就在寻找的方法上缓存更多重复的下标结果集
  // 有序 i-
  nums = Array.from( new Set( nums ) );
  for ( let i = 0; i < nums.length; i++ )
  {
    if ( map[ i ] )
    {
      continue;
    }
    //当缓冲中数量超过最大的可能性后不寻找下面结果
    if ( max > ( nums.length - Object.keys( map ).length ) )
    {
      break;
    }
    let base = nums[ i ];
    let l = baseL( base, nums );
    let r = baseR( base, nums );
    max = Math.max( max, l + r + 1 );
    /**
    *
    * @param {number} base
    * @param {number[]} nums
    */
    function baseR ( base, nums )
    {
      let index = 0;
      let _$;
      while ( ( _$ = nums.indexOf( ++base ) ) > -1 )
      {
        index++;
        map[ _$ ] = true;
      }
      return index;
    }
    /**
     *
     * @param {number} base
     * @param {number[]} nums
     */
    function baseL ( base, nums )
    {
      let index = 0;
      let _$;
      while ( ( _$ = nums.indexOf( --base ) ) > -1 )
      {
        map[ _$ ] = true;
        index++;
      }
      return index;
    }
  }
  return max;
};
console.log( longestConsecutive( [ 9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6 ] ) );


/**
 * @param {string} astr
 * @return {boolean}
 */
var isUnique = function ( astr )
{
  let map = {};
  let index = 0;
  while ( index < astr.length )
  {
    let a = astr[ index++ ];
    if ( map[ a ] )
    {
      return false;
    } else
    {
      map[ a ] = true;
    }
  }
  return true;
};
/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
var CheckPermutation = function ( s1, s2 )
{
  if ( s1.length !== s2.length )
    return false;
  let map = {};
  for ( let i = 0; i < s1.length; i++ )
  {
    let a = s1[ i ];
    let _$;
    if ( ( _$ = s2.indexOf( a ) ) > - 1 )
    {
      if ( map[ _$ ] )
      {
        while ( ( _$ = s2.indexOf( a, _$ + 1 ) ) > -1 && map[ _$ ] !== undefined )
        {
          map[ _$ ] = true;
        }
        if ( _$ === -1 )
          return false;
      } else
      {
        map[ _$ ] = true;
      }
    } else return false;
  }
  return true;
};
console.log( CheckPermutation( "aab", "abb" ) );
/**
 *
 * @param {number} n
 * @returns
 */
var generateParenthesis = function ( n )
{
  let result = [];
  dfs( "", n, n, result );
  return result;
  function dfs ( arg0, left, right, result )
  {
    if ( left === 0 && right === 0 )
    {
      result.push( arg0 );
      return;
    }
    if ( left > right )
    {
      return;
    }
    if ( left > 0 )
      dfs( `${ arg0 }(`, left - 1, right, result )
    if ( right > 0 )
      dfs( `${ arg0 })`, left, right - 1, result )
  }
}
console.log( generateParenthesis( 5 ) );
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function ( x )
{
  return dfs( x, x );
  function dfs ( arg, x )
  {
    let a = Math.ceil( arg / 2 );
    let product = a * a;
    if ( product === x )
    {
      return a;
    }
    else if ( product > x )
    {
      return dfs( a, x )
    } else
    {
      while ( product < x )
      {
        a++;
        product = ( a ) * ( a );
        if ( product === x )
          return a;
      }
      return a - 1;
    }
  }
};

var uniquePaths = function ( m, n )
{
  //
};
console.log( uniquePaths( 3, 7 ) );
/**
 * @param {number} numRows
 * @return {number[][]}
 */
var generate = function ( numRows )
{
  let res = [];
  for ( let i = 1; i <= numRows + 1; i++ )
  {
    res.push( CreateArray( i, res ) )
  }
  return res;
  /**
   *
   * @param {number} i
   * @param {number[][]} res
   * @returns {number[]}
   */
  function CreateArray ( i, res )
  {
    const result = new Array( i );
    result[ 0 ] = 1;
    result[ i - 1 ] = 1;
    let dest = res[ i - 2 ];
    for ( let index = 1; index < i - 1; index++ )
    {
      result[ index ] = dest[ index - 1 ] + dest[ index ];
    }
    return result;
  }
};
console.log( generate( 3 ) );
/**
* @param {number[][]} triangle
* @return {number}
*/
var minimumTotal = function ( triangle )
{
  let memory = [ [ triangle[ 0 ][ 0 ] ] ];
  for ( let row = 1; row < triangle.length; row++ )
  {
    memory[ row ][ 0 ] = memory[ row - 1 ][ 0 ] + triangle[ row ][ 0 ];
    for ( let colum = 1; colum < row; colum++ )
    {
      memory[ row ][ colum ] = Math.min( memory[ row - 1 ][ colum - 1 ], memory[ row - 1 ][ colum ] + triangle[ row ][ colum ] );
    }
    memory[ row ][ row ] = memory[ row - 1 ][ row - 1 ] + triangle[ row ][ row ];
  }

  return memory[ triangle.length - 1 ].sort( ( a, b ) => a - b )[ 0 ]
  /**
   1
   1 2
   1 2 3
   1 2 3 4
   1 2 3 4 5
  */


};
/*
   -1
  3 2
-3 1 -1

*/
/**
 * @param {string} s
 * @return {number}
 */
var longestValidParentheses = function ( s )
{
  let pos = 0;
  function next ()
  {
    token = pos === s.length ? -1 : s[ pos++ ];
  }
  let token;
  let start = 0, max = 0;
  let stack = new Array( 0 );
  next();
  while ( token !== -1 )
  {
    if ( token === "(" )
    {
      stack.push( pos - 1 );
    } else
    {
      if ( stack.length > 0 )
      {
        stack.pop();
        if ( stack.length === 0 )
        {
          max = Math.max( max, pos - start );
        } else
        {
          max = Math.max( max, pos - stack[ stack.length - 1 ] - 1 )
        }
      } else
      {
        start = pos;
      }
    }
    next();
  }
  return max;
};

console.log( longestValidParentheses( "(()" ) );

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function ( nums, target )
{
  //判断数组中间是否旋转
  let mid = Math.ceil( nums.length / 2 );
  if ( target === nums[ mid ] )
    return mid;


};