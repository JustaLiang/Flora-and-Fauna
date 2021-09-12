import React, { useContext, useEffect, useState } from 'react';
import { Container, Box, Typography } from '@material-ui/core';
import { Field, FieldInfo } from './Field';
import { BattlefieldContext } from '../hardhat/SymfoniContext';

interface Props { }

export const Battlefield: React.FC<Props> = () => {
    const battlefield = useContext(BattlefieldContext);
    const [fieldInfos, setFieldInfos] = useState<FieldInfo[]>([]);

    useEffect(() => {
        const loadFields = async () => {
            if (!battlefield.instance) return;
            setFieldInfos(await battlefield.instance.getAllFieldInfo());
        }
        loadFields();
    }, [battlefield])

    return (
        <div>
            <Container maxWidth='lg' style={{ height: 1200 }}>
                <Box style={{ marginLeft: 10, marginBottom: 20 }}>
                    
                    <Typography variant='h6' style={{fontWeight:'bold'}}> Battlefield</Typography>
                </Box>
                <Box style={{
                    paddingTop: 50,
                    paddingLeft: 90,
                    marginLeft: 10,
                    paddingBottom: 50,
                    border: '0.5px solid rgba(0, 0, 0, 0.125)',
                    width: 1100, gap: 1
                }}
                    display='flex'
                    flexDirection='row'
                    flexWrap='wrap'>
                    {
                        fieldInfos.map((field,index) => {
                            return (
                                <Box key={index} >
                                    <Field 
                                    fId={index}
                                    fieldInfo={field}
                                    />
                                </Box>)
                        })
                    }
                </Box>
            </Container>
        </div>
    )
}