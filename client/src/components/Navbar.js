import React, { useState } from "react";
import {useHistory} from "react-router-dom";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import Logo from './../../src/Helix.jpeg';

const Navbar = () => {
    return (
        <div style={{display: "flex", flexDirection: 'row', width: '100%', display: 'flex', justifyContent: 'space-between'}}>
            <div>
                    <img src={Logo} alt="React Logo" style={{width: '15%'}}/>
                </div>
            <a href="https://rigorous-parsnip-bbe.notion.site/Learn-a5f878b12c624bfa95933fe4546b6635">
    
                <button style={{backgroundColor: 'white', color: 'white'}}>
                    <h2 style={{color: 'midnightblue'}}>Learn</h2>
                </button> 
            </a>
        </div>
    )
    }
    export default Navbar