import React from 'react'
import { Container, Box, Typography } from '@material-ui/core'
import PropTypes from 'prop-types';

import Field from './Field'
const field = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

export default function Battlefield({fields,getMinionInfo,onFloraConquer,onFaunaConquer,onRetreat,checksumAcc}) {
    console.log('fields in battlefields: ',fields)
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
                        fields.map((field,index) => {
                            return (
                                <Box id={index} >
                                    <Field 
                                    _id={index}
                                    field={field}
                                    getMinionInfo={getMinionInfo}
                                    onFloraConquer={onFloraConquer}
                                    onFaunaConquer={onFaunaConquer}
                                    onRetreat={onRetreat}
                                    checksumAcc={checksumAcc}
                                    />
                                </Box>)
                        }
                        )
                    }
                </Box>
            </Container>
        </div>
    )
}

Battlefield.propTypes = {
    fields: PropTypes.array.isRequired,
    getMinionInfo: PropTypes.func.isRequired,
    onFloraConquer: PropTypes.func.isRequired,
    onFaunaConquer: PropTypes.func.isRequired,
    onRetreat:PropTypes.func.isRequired,
    checksumAcc:PropTypes.string.isRequired
  }