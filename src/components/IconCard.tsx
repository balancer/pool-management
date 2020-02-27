import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

export default function IconCard(props) {
    const { title, text, text2, addRows } = props;
    // const bull = <span className={classes.bullet}>•</span>

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
                {/* <Typography className={classes.pos} color="textSecondary">
                    adjective
                </Typography> */}
                <Typography variant="body2" component="p">
                    {text}
                </Typography>
                {text2 ? (
                    <Typography variant="body2" component="p">
                        {text2}
                    </Typography>
                ) : (
                    <div />
                )}
                {addRows ? <br /> : <div />}
            </CardContent>
            {/* <CardActions>
                <Button size="small">Learn More</Button>
            </CardActions> */}
        </Card>
    );
}
