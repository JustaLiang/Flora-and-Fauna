import React,{useState} from 'react'
import {CardHeader, Card, CardContent, CardActions, Box, Avatar, Typography, IconButton, Button, Snackbar } from '@material-ui/core';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
export default function Field() {
    const [shadow,setShadow] = useState(1)
    const [open,setOpen] = useState(false)
    const handleClick = () => {
        setOpen(true)
    }
    return (
        <div  >
            <Card 
            elevation={shadow}
            onMouseOver={()=>{setShadow(5)}}
            onMouseOut={()=>{setShadow(1)}}
            onClick={handleClick}
            style={{height:200,width:200,borderRadius:20,display: 'flex',
           alignItems:'center',justifyContent:'center'}}>
              <EmojiFlagsIcon style={{width:75,height:75}}/> 
            </Card>
            
        </div>
    )
}
