import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconCard from 'components/IconCard';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
}));

export default function PoolTitleCard(props) {
    const { address } = props;
    const classes = useStyles({});

    return (
        <div className={classes.root}>
            <Grid container spacing={3}>
                <Grid item xs={6} sm={9}>
                    <IconCard title="Pool" text={address} />
                </Grid>
            </Grid>
        </div>
    );
}
