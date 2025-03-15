
import { createSlice } from '@reduxjs/toolkit';
import {useMemo} from "react";
import { createTheme } from "@mui/material/styles";
import {useDispatch, useSelector} from "react-redux";
import {themeSettings}  from "../../theme.js";


const initialState = {
    mode: 'dark',
};

const colorModeSlice = createSlice({
    name: 'colorMode',
    initialState,
    reducers: {
        toggleColorMode: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
        },
        setMode: (state, action) => {
            state.mode = action.payload;
        }
    },
});


export const useMode = () => {
    const dispatch = useDispatch();
    // const mode = useSelector((state) => state.colorMode.mode);
    const mode =useSelector(state => state.mode.mode || 'dark');
    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => dispatch(toggleColorMode()),
        }),
        [dispatch]
    );

    return [theme, colorMode];
};
export const { toggleColorMode } = colorModeSlice.actions;
export default colorModeSlice.reducer;
