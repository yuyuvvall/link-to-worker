import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import {Badge, Tab, Tabs} from '@mui/material';
import {Link} from 'react-router-dom';

import './responsive-app-bar.less';

export type ResponsiveAppBarProps = {
    actions: {icon: React.ReactNode; onClick: () => void; badge?: number}[];
    dir?: 'rtl' | 'ltr';
    isElevated?: boolean;
    logo: string;
    selectedTabIndex: number;
    tabs: {name: string; redirect: string}[];
};

const ResponsiveAppBar = ({
    actions,
    dir = 'rtl',
    isElevated,
    logo,
    selectedTabIndex,
    tabs
}: ResponsiveAppBarProps) => (
    <AppBar className="app-bar" elevation={isElevated ? 4 : 0} color="transparent" position="static" dir={dir}>
        <Container maxWidth={'xl'} dir={dir} sx={{my: 1}}>
            <Toolbar dir={dir} disableGutters>
                <img className="logo" src={logo} />

                <Box className="tabs-container" sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}} dir={dir}>
                    <Tabs
                        value={selectedTabIndex}
                        dir={dir}
                        TabIndicatorProps={{style: {backgroundColor: 'black'}}}
                        textColor="inherit"
                    >
                        {tabs.map(tab => (
                            <Tab
                                component={Link}
                                to={`/${tab.redirect}`}
                                key={tab.name}
                                label={tab.name}
                                sx={{fontSize: 16, color: 'black'}}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box className="actions-container">
                    {actions.map(({icon, onClick, badge}, index) => (
                        <IconButton key={index} onClick={onClick}>
                            <Badge badgeContent={badge} color="error">
                                {icon}
                            </Badge>
                        </IconButton>
                    ))}
                </Box>
            </Toolbar>
        </Container>
    </AppBar>
);

export default ResponsiveAppBar