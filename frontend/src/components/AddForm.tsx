import { Box, Button, Dialog, DialogTitle, Fab, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";
import CheckIcon from '@material-ui/icons/Check';
import { File, NFTStorage } from 'nft.storage';
import React, { useState } from 'react';
import { MetaData } from './MetaDataForm';

const NFT_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEU1MjA4ZDE2QUJhOTU4MjhEN2Y0QzRFMTJFNTZmOTAxN0QxN2ZkZGQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMTQzMTg3NDg5OCwibmFtZSI6InRlc3RfZmlsZV91cGxvYWQifQ.4CiGIYN_bFDbRBmi9EBarnmy58O_UoMGSubK5C21ZrI"
const client = new NFTStorage({ token: NFT_STORAGE_KEY })
const useStyles = makeStyles((theme) => ({
    blockButton:{
        '&:hover':{
            backgroundColor:'rgba(215,215,221,0.4)',
        }
    }
}));

interface Props {
    _id: number
    name: string
    isUploaded: boolean
    onMetaDataSubmit: (_id: number, metaDataUrl: MetaData) => void
}
interface IState {
    name: string | undefined
    description: string | undefined
    file: File | undefined
}
const AddForm = ({ _id, name, isUploaded, onMetaDataSubmit }: Props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<IState>({
        name: "",
        description: "",
        file: undefined
    });
    const [fileUrl, setFileUrl] = useState("")

    const handleClick = () => {
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        else {
            if (!event.target.files[0]) return;
            setState({ ...state, [event.target.name]: event.target.files[0] })
            setFileUrl(URL.createObjectURL(event.target.files[0]));
        }
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.value })
    }
    const handleSubmit = async () => {
        if (!state.name || !state.description || !state.file) return;
        const metaData = await client.store({
            name: state.name,
            description: state.description,
            image: new File([state.file], name + '.jpg', { type: 'image/jpg' })
        })
        const data = {
            name: state.name,
            description: state.description,
            image:  metaData.data.image.href
        }
        onMetaDataSubmit(_id,data);
        setOpen(false);
    }
    return (
        <Box style={{ textAlign: 'center' }}>
            <Typography>{name}</Typography>
            <Box
                className={classes.blockButton}
                onClick={handleClick}
                style={{ height: 200, width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(169,169,188,0.4)', borderRadius: 10 }}>
                {isUploaded?<CheckIcon style={{width:40, height:40,color:'green'}}/>:<AddIcon />}
            </Box>
            <Dialog open={open} style={{ textAlign: 'center' }} onClose={handleClose}>
                <DialogTitle style={{ width: 400 }}>{isUploaded?"You already submit your metadata":"Enter your metadata"}</DialogTitle>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 30, marginBottom: 20 }}>
                    <Box>
                        <TextField disabled={isUploaded} autoFocus={true} variant='outlined' name='name' placeholder='Enter name...' style={{ width: 300 }} value={state.name} onChange={handleChange} />
                    </Box>
                    <Box>
                        <TextField disabled={isUploaded} variant='outlined' multiline={true} name='description' minRows={5} placeholder='Enter description...' value={state.description} onChange={handleChange} style={{ width: 300 }} />
                    </Box>
                    <Box>
                        <input disabled={isUploaded} id='file-upload' type='file' name='file' accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                        <label htmlFor='file-upload'>
                            {!fileUrl ?
                                <Fab component="span" >
                                    <AddPhotoAlternateIcon />
                                </Fab> :
                                <img src={fileUrl} alt='none' style={{ width: 300, height: 300 }} />
                            }
                        </label>
                    </Box>
                    {isUploaded?<></>:
                    <Box>
                        <Button
                            variant='outlined'
                            disabled={!state.name || !state.description || !state.file}
                            onClick={handleSubmit}
                        > Upload </Button>
                    </Box>
                    }
                </Box>
            </Dialog>
        </Box>
    )
}

export default AddForm
