import React from "react";
import MyElement from "./Datenelement"


export default function Datenliste({daten}) {
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