import React from 'react';
type DatenProps={
    index:number;
    text:string;
}

export default function Datenelement({index,text}:DatenProps)
{
    return(
        <p key={index}>{index}-{text}</p>
    )
}