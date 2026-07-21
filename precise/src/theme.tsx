import { createTheme, alpha, ThemeOptions, Theme } from '@mui/material/styles'
import darkScrollbar from '@mui/material/darkScrollbar'

export const createTrinoTheme = (options: ThemeOptions): Theme => {
    const baseTheme = createTheme(options)
    baseTheme.components = {
        ...baseTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: baseTheme.shape.borderRadius,
                    textTransform: 'none' as const,
                    fontWeight: 600,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    '&.MuiTableCell-head': {
                        backgroundColor: alpha(baseTheme.palette.primary.main, baseTheme.palette.mode === 'light' ? 0.05 : 0.12),
                        fontWeight: 600,
                    },
                },
            },
        },
        ...(baseTheme.palette.mode === 'dark' ? {
            MuiScopedCssBaseline: {
                styleOverrides: {
                    root: darkScrollbar(),
                },
            },
        } : {}),
    }
    return baseTheme
}

export const lightTheme = createTrinoTheme({
    palette: {
        mode: 'light',
    },
})

export const darkTheme = createTrinoTheme({
    palette: {
        mode: 'dark',
    },
})

