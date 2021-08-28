import React,{useState} from 'react'
import {CardHeader, Card, CardContent, CardActions, Box, Avatar, Typography, IconButton, Button, Snackbar,Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
export default function Field() {
    const [shadow,setShadow] = useState(1)
    const [open,setOpen] = useState(false)
    const handleClick = () => {
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false);
      };
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
            <Dialog open={open} style={{ textAlign: 'center' }} onClose={handleClose}>
              <DialogTitle id="form-dialog-title" style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
                  <Box><Typography>Field Info</Typography></Box>
                  <Box>
              <IconButton onClick={handleClose} ><CloseIcon/>
              </IconButton>
              </Box>
              </DialogTitle>
              <Box style={{height:500,width:500}}> 

              </Box>
            </Dialog>
            
        </div>
    )
}
