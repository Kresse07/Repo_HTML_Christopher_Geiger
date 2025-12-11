import React from "react";
import MyElement from "./Datenelement"


type DatenProps = 
{
    daten: string[];
}

export default function Datenliste({daten}: DatenProps) {
    return (
        <>
            {
                daten.map((text, index) => (
                    <MyElement index={index} text = {text} />
                ))
            }
        </>


    )
}