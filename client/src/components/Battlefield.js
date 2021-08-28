import React from 'react'
import { Container, Box, Typography } from '@material-ui/core'

import Field from './Field'
const field = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

export default function Battlefield() {

    return (
        <div>
            <Container maxWidth='lg' style={{ height: 1200 }}>
                <Box style={{ marginLeft: 10, marginBottom: 20 }}>
                    <Typography variant='h6'> Battlefield</Typography>
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
                        field.map(i => {
                            return (
                                <Box id={i}>
                                    <Field />
                                </Box>)
                        }
                        )
                    }
                </Box>
            </Container>
        </div>
    )
}
