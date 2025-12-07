import React, { useState, useEffect } from 'react'
import { Box, Stack, Typography, TextField, InputAdornment, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

interface SubstitutionField {
    name: string
    type: 'varchar' | 'bigint' | 'double'
    defaultValue?: string
    options?: string[] // TODO: Implement options retrieval
}

interface SubstitutionEditorProps {
    query: string
    onSubstitutionChange: (substitutions: Record<string, string>) => void
}

const SubstitutionEditor: React.FC<SubstitutionEditorProps> = ({ query, onSubstitutionChange }) => {
    const [fields, setFields] = useState<SubstitutionField[]>([])
    const [values, setValues] = useState<Record<string, string>>({})

    useEffect(() => {
        const extractedFields = extractSubstitutionFields(query)
        setFields(extractedFields)
        const initialValues = extractedFields.reduce(
            (acc, field) => {
                acc[field.name] = field.defaultValue || ''
                return acc
            },
            {} as Record<string, string>
        )
        setValues(initialValues)
        onSubstitutionChange(initialValues)
    }, [query, onSubstitutionChange])

    const handleInputChange = (name: string, value: string) => {
        setValues((prev) => {
            const newValues = { ...prev, [name]: value }
            onSubstitutionChange(newValues)
            return newValues
        })
    }

    const extractSubstitutionFields = (query: string): SubstitutionField[] => {
        const regex =
            /\/\*\s*\{\{\s*([A-z\s0-9]+)(?::(varchar|bigint|double)?(?::([a-zA-Z0-9.-_\s]+)?)?)?\s*\}\}\s*\*\//g
        const fields: SubstitutionField[] = []
        let match

        while ((match = regex.exec(query)) !== null) {
            fields.push({
                name: match[1],
                type: (match[2] as 'varchar' | 'bigint' | 'double') || 'varchar',
                defaultValue: match[3],
            })
        }

        return fields
    }

    if (fields.length === 0) {
        return null
    }

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6">Query Parameters</Typography>
            <Stack spacing={1}>
                {fields.map((field) => {
                    const isNumber = field.type !== 'varchar'
                    const val = values[field.name] ?? ''

                    return (
                        <TextField
                            key={field.name}
                            label={field.name}
                            size="small"
                            fullWidth
                            variant="outlined"
                            type={isNumber ? 'number' : 'text'}
                            value={val}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.defaultValue !== undefined ? String(field.defaultValue) : ''}
                            slotProps={{
                                input: {
                                    // helpful for numeric types
                                    inputProps: isNumber ? { step: field.type === 'double' ? 'any' : 1 } : undefined,
                                    // optional clear button (keeps width stable when empty)
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                edge="end"
                                                aria-label={`Clear ${field.name}`}
                                                onClick={() => handleInputChange(field.name, '')}
                                                sx={{
                                                    visibility: val ? 'visible' : 'hidden',
                                                    '& .MuiSvgIcon-root': { fontSize: 16 },
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    )
                })}
            </Stack>
        </Box>
    )
}

export default SubstitutionEditor
