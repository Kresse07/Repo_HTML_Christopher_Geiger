import React from 'react';

export default function Datenelement({index,text})
{
    return(
        <p key={index}>{index}-{text}</p>
    )
}