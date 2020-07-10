import React, { ReactNode } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import { Create as CreateIcon, List as ListIcon } from '@material-ui/icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import routes from '../../constants/routes.json';
import Logo from '../../components/Logo';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
}));

type Props = {
  children: ReactNode;
};

export default function CreatePageWrapper(props: Props) {
  const { children } = props;
  const classes = useStyles();
  return (
    <div>
      <Drawer
        open
        variant="persistent"
        anchor="left"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Logo />
        <List>
          <ListItem button component="a" href={routes.CREATE.NAME}>
            <ListItemIcon>
              <CreateIcon />
            </ListItemIcon>
            <ListItemText>Create Sequence</ListItemText>
          </ListItem>
          <ListItem button component="a" href={routes.LIST}>
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText>My Sequences</ListItemText>
          </ListItem>
        </List>
      </Drawer>
      <div className={classes.appBarShift}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5">Create Sequence</Typography>
          </Toolbar>
        </AppBar>
        <div>
          <Box my={1} height="78vh" style={{ textAlign: 'center' }}>
            <Card
              style={{
                height: '100%',
                padding: '30px',
                position: 'relative',
              }}
            >
              <Grid
                container
                alignItems="center"
                style={{
                  height: '100%',
                  paddingTop: '30px',
                  paddingBottom: '30px',
                }}
              >
                {children}
              </Grid>
            </Card>
          </Box>
        </div>
      </div>
    </div>
  );
}
