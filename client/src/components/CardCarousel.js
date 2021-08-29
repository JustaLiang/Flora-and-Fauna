import React from 'react'
import Carousel from 'react-material-ui-carousel'
import PropTypes from 'prop-types';
import {Box} from '@material-ui/core';

export default function CardCarousel({urlList}) {
    console.log(urlList)
    return (
        <div>
            <Carousel>
                {
                    urlList.map((item)=>(
                        <Box style={{backgroundImage: `url(${item})`,
                            backgroundSize: "cover",
                            backgroundPosition: '50% 50%',
                            width: 280,
                            height: 280,}}/>
                    ))

                }
            </Carousel>
        </div>
    )
}

CardCarousel.propTypes = {
    urlList:PropTypes.array.isRequired,
}