import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Carousel from 'react-material-ui-carousel'
import PropTypes from 'prop-types';
import {Box} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function CardCarousel({urlList}) {
    console.log(urlList)
    return (
        <div>
            <Carousel>
                {urlList.length?(
                    urlList.map((item)=>(
                        <Box style={{backgroundImage: `url(${item})`,
                            backgroundSize: "cover",
                            backgroundPosition: '50% 50%',
                            width: 280,
                            height: 280,}}/>
                       
                    ))):(
                    <Box 
                    style={{textAlign:'center',paddingTop:150,width: 280,
                    height: 280,}}>
                        <CircularProgress/>
                    </Box>)

                }
            </Carousel>
        </div>
    )
}

CardCarousel.propTypes = {
    urlList:PropTypes.array.isRequired,
}