import React from 'react';
import Carousel from 'react-material-ui-carousel';
import { Box } from '@material-ui/core';

interface Props {
    urlList: string[]
}

export const CardCarousel: React.FC<Props> = (props) => {
    const { urlList } = props;
    return (
        <div>
            <Carousel>
                {
                    urlList.map((item, idx)=>(
                        <Box
                            key={idx} 
                            style={{backgroundImage: `url(${item})`,
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