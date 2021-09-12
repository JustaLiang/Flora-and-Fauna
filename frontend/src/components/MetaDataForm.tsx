import { Box, Button, Typography } from '@material-ui/core';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import { File, NFTStorage } from 'nft.storage';
import React, { useContext, useState } from 'react';
import { BattlefieldContext } from '../hardhat/SymfoniContext';
import AddForm from './AddForm';

const NFT_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEU1MjA4ZDE2QUJhOTU4MjhEN2Y0QzRFMTJFNTZmOTAxN0QxN2ZkZGQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMTQzMTg3NDg5OCwibmFtZSI6InRlc3RfZmlsZV91cGxvYWQifQ.4CiGIYN_bFDbRBmi9EBarnmy58O_UoMGSubK5C21ZrI"
const client = new NFTStorage({ token: NFT_STORAGE_KEY })
interface Props {

}
export interface MetaData {
    name?: string
    description?: string
    image?: string
}
function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box display="flex" alignItems="center">
            <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={35}>
                <Typography variant="body2" color="textSecondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

const nameList = ['flora_1', 'flora_2', 'flora_3', 'flora_4', 'flora_5', 'fauna_1', 'fauna_2', 'fauna_3', 'fauna_4', 'fauna_5', 'series'];
const MetaDataForm = (props: Props) => {
    const battlefield = useContext(BattlefieldContext);
    const [metaData, setMetaData] = useState<MetaData[]>([
        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
    const [uploadList, setUploadList] = useState([false, false, false, false, false, false, false, false, false, false, false])
    const onMetaDataSubmit = (_id: number, data: MetaData) => {
        let tempMetaData = metaData;
        let tempUploadList = uploadList;
        tempMetaData[_id] = data;
        tempUploadList[_id] = true;
        setMetaData([...tempMetaData]);
        setUploadList([...tempUploadList]);
    }
    const onProposalSubmit = async () => {
        let jsonList = []
        for (let i = 0; i < metaData.length; i++) {
            jsonList.push(new File([JSON.stringify(metaData[i])], nameList[i], { type: 'application/json' }));
        }
        const cid = await client.storeDirectory(jsonList);
        const url = 'ipfs://' + cid + '/';
        console.log(url)
        onPropose(url);
    }
    const onPropose = async (uriPrefix: string) => {
        if (!battlefield.instance) return;
        if (!uriPrefix || uriPrefix.slice(-1) !== '/') return;
        const tx = await battlefield.instance.propose(uriPrefix, { value: 10 ** 12 });
        const receipt = await tx.wait();
        if (receipt.status) {
            console.log(receipt.logs);
        }
        else {
            console.log(receipt.logs);
        }
    }

    const progress = uploadList.filter(Boolean).length / 11 * 100;
    const allUploaded = uploadList.every(Boolean);
    return (
        <Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Box>
                    <Typography variant='h6'>Upload your proposal metadata</Typography>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {nameList.map((item, _id) => (
                        <AddForm key={_id} _id={_id} name={item} isUploaded={uploadList[_id]} onMetaDataSubmit={onMetaDataSubmit} />
                    ))
                    }
                </Box>
                <Box style={{ marginBottom: 20,marginTop:20 }} >
                    <LinearProgressWithLabel value={progress} />
                    <Button variant='outlined' disabled={!allUploaded} style={{ marginTop:20, textTransform: 'none' }} onClick={onProposalSubmit}> Submit Proposal</Button>
                </Box>
            </Box>
        </Box>
    )
}

export default MetaDataForm
