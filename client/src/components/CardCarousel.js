import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Carousel from 'react-material-ui-carousel'
import PropTypes from 'prop-types';
import {Box} from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
    image:{
        
    }

}))
export default function CardCarousel({urlList}) {
    const classes = useStyles()
    const list= ["https://ipfs.io/ipfs/bafybeibddynvrkp7kst3efcaui36cr6kmlvpjgedepj5njwyhwbdckv4ru/fauna_1.jpg","https://ipfs.io/ipfs/bafybeibeqrjfm35qpl5alp2wuaafnhxkzdzaqbfelg5csvzx5toukl4yki/flora_1.jpg","https://ipfs.io/ipfs/bafybeihip42ifvaachytmquwapbnuzp462x6q3icwjxyshyrh7k46sayqa/fauna_5.jpg"]
    return (
        <div>
            <Carousel>
                {
                    list.map((item)=>(
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