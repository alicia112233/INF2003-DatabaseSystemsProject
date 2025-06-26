import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    ListItemText,
    Checkbox,
} from '@mui/material';
import { Promotion, CreatePromotionRequest } from '@/types/promotion';

interface Game {
    id: number;
    title: string;
    // Add other game properties as needed
}

interface PromotionFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePromotionRequest) => void;
    promotion?: Promotion | null;
    loading?: boolean;
}

interface UpdatePromotionRequest extends CreatePromotionRequest {
    id?: number;
}

interface GameWithPromotion extends Game {
    promo_id?: number | null;
    promo_code?: string | null;
}

// Helper function to format date for input[type="date"]
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    // Handle different date formats
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Use local timezone instead of UTC to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const PromotionFormDialog: React.FC<PromotionFormDialogProps> = ({
    open,
    onClose,
    onSubmit,
    promotion,
    loading = false,
}) => {
    const [formData, setFormData] = useState<CreatePromotionRequest>({
        code: '',
        description: '',
        discountValue: 0,
        discountType: 'fixed',
        maxUsage: undefined,
        startDate: '',
        endDate: '',
        isActive: true,
        applicableToAll: true,
        selectedGameIds: [],
    });

    // Game state
    const [games, setGames] = useState<GameWithPromotion[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);

    // Fetch games when component mounts or when applicableToAll changes to false
    useEffect(() => {
        if (open && (!formData.applicableToAll || (promotion && !promotion.applicableToAll))) {
            fetchGames();
        }
    }, [open, formData.applicableToAll, promotion]);

    const fetchGames = async (): Promise<void> => {
        setLoadingGames(true);
        try {
            const response = await fetch('/api/games/with-promotions');
            if (response.ok) {
                const gamesData = await response.json();
                setGames(gamesData);
            } else {
                console.error('Failed to fetch games');
            }
        } catch (error) {
            console.error('Error fetching games:', error);
        } finally {
            setLoadingGames(false);
        }
    };

    useEffect(() => {
        if (promotion) {
            // If promotion is not applicable to all, fetch games first
            if (!promotion.applicableToAll) {
                fetchGames().then(() => {
                    // Fetch assigned games for this promotion
                    fetchAssignedGames(promotion.id).then((assignedGameIds) => {
                        // Set form data after games and assigned games are fetched
                        setFormData({
                            code: promotion.code,
                            description: promotion.description,
                            discountValue: promotion.discountValue,
                            discountType: promotion.discountType,
                            maxUsage: promotion.maxUsage || undefined,
                            startDate: formatDateForInput(promotion.startDate),
                            endDate: formatDateForInput(promotion.endDate),
                            isActive: promotion.isActive,
                            applicableToAll: promotion.applicableToAll,
                            selectedGameIds: assignedGameIds,
                        });
                    });
                });
            } else {
                // If applicable to all, set form data immediately
                setFormData({
                    code: promotion.code,
                    description: promotion.description,
                    discountValue: promotion.discountValue,
                    discountType: promotion.discountType,
                    maxUsage: promotion.maxUsage || undefined,
                    startDate: formatDateForInput(promotion.startDate),
                    endDate: formatDateForInput(promotion.endDate),
                    isActive: promotion.isActive,
                    applicableToAll: promotion.applicableToAll,
                    selectedGameIds: [],
                });
            }
        } else {
            setFormData({
                code: '',
                description: '',
                discountValue: 0,
                discountType: 'fixed',
                maxUsage: undefined,
                startDate: '',
                endDate: '',
                isActive: true,
                applicableToAll: true,
                selectedGameIds: [],
            });
        }
        // Clear errors when dialog opens/closes or promotion changes
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [promotion, open]);

    const [errors, setErrors] = useState<{
        discountValue?: string;
        general?: string;
        code?: string;
        description?: string;
        dateRange?: string;
        startDate?: string;
        selectedGames?: string;
    }>({});

    // Helper function to validate dates and clear errors when requirements are met
    const validateDates = (startDate: string, endDate: string) => {
        const newErrors = { ...errors };
        const today = getTodayDate();
        
        // Check if both dates are provided
        const hasStartDate = startDate.trim() !== '';
        const hasEndDate = endDate.trim() !== '';
        
        // Clear general error if both dates are now provided
        if (hasStartDate && hasEndDate) {
            delete newErrors.general;
        }
        
        // Validate start date (must be today or after)
        if (hasStartDate) {
            if (startDate < today) {
                newErrors.startDate = 'Start date cannot be in the past';
            } else {
                // Start date is valid, clear start date error
                delete newErrors.startDate;
            }
        } else {
            // If start date is missing, clear start date error
            delete newErrors.startDate;
        }
        
        // Check date range validity
        if (hasStartDate && hasEndDate) {
            if (startDate <= endDate) {
                // Dates are valid, clear date range error
                delete newErrors.dateRange;
            } else {
                // End date is before start date
                newErrors.dateRange = 'End date must be after start date';
            }
        } else {
            // If either date is missing, clear date range error
            delete newErrors.dateRange;
        }
        
        setErrors(newErrors);
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};
        const today = getTodayDate();

        // Required field validation
        if (!formData.code.trim()) {
            newErrors.code = 'Promotion code is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (formData.discountValue <= 0) {
            newErrors.discountValue = 'Discount value must be greater than 0';
        }

        // Validate percentage discount value
        if (formData.discountType === 'percentage' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage discount cannot exceed 100%';
        }

        // Validate game selection when not applicable to all
        if (!formData.applicableToAll && (!formData.selectedGameIds || formData.selectedGameIds.length === 0)) {
            newErrors.selectedGames = 'Please select at least one game when not applicable to all';
        }

        // Date validation
        if (!formData.startDate || !formData.endDate) {
            const missingDates = [];
            if (!formData.startDate) missingDates.push('Start date');
            if (!formData.endDate) missingDates.push('End date');
            newErrors.general = `${missingDates.join(' and ')} ${missingDates.length > 1 ? 'are' : 'is'} required`;
        } else {
            // Validate start date is not in the past
            if (formData.startDate < today) {
                newErrors.startDate = 'Start date cannot be in the past';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const submitData: UpdatePromotionRequest = {
            ...formData,
            code: formData.code.replace(/\s/g, '').toUpperCase(),
            discountValue: formData.discountValue,
            maxUsage: formData.maxUsage ?? null,
            selectedGameIds: formData.applicableToAll ? [] : formData.selectedGameIds,
        };

        // Add promotion ID if editing
        if (promotion) {
            submitData.id = promotion.id;
        }

        onSubmit(submitData);
    };

    // function to fetch games assigned to a specific promotion
    const fetchAssignedGames = async (promotionId: number): Promise<number[]> => {
        try {
            const response = await fetch(`/api/promotions/${promotionId}/assigned-games`);
            if (response.ok) {
                const assignedGames = await response.json();
                return assignedGames.map((game: any) => game.id);
            } else {
                console.error('Failed to fetch assigned games');
                return [];
            }
        } catch (error) {
            console.error('Error fetching assigned games:', error);
            return [];
        }
    };

    // Update the handleChange function for applicableToAll
    const handleChange = (field: keyof CreatePromotionRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value: any = e.target.value;

        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else if (field === 'discountValue') {
            // Validate discountValue: max 2 decimal places
            const decimalMatch = /^(\d+)(\.\d{0,2})?$/.test(value);
            if (!decimalMatch && value !== '') {
                setErrors((prev) => ({
                    ...prev,
                    discountValue: 'Enter a valid amount (up to 2 decimal places)',
                }));
                return;
            } else {
                // Clear discount value error
                const newErrors = { ...errors };
                delete newErrors.discountValue;
                
                // Validate percentage if discount type is percentage
                if (formData.discountType === 'percentage' && parseFloat(value) > 100) {
                    newErrors.discountValue = 'Percentage discount cannot exceed 100%';
                }
                
                setErrors(newErrors);
            }
        }

        const newFormData = {
            ...formData,
            [field]: value,
        };

        // If switching applicableToAll to true, clear selected games
        if (field === 'applicableToAll' && value === true) {
            newFormData.selectedGameIds = [];
            // Clear game selection error
            const newErrors = { ...errors };
            delete newErrors.selectedGames;
            setErrors(newErrors);
        }

        // If switching applicableToAll to false, fetch games and assigned games
        if (field === 'applicableToAll' && value === false) {
            if (games.length === 0) {
                fetchGames();
            }
            
            // If editing an existing promotion, fetch currently assigned games
            if (promotion && promotion.id) {
                fetchAssignedGames(promotion.id).then((assignedGameIds) => {
                    setFormData(prev => ({
                        ...prev,
                        selectedGameIds: assignedGameIds,
                    }));
                });
            }
        }

        setFormData(newFormData);

        // Clear specific field errors when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }

        // Special handling for date fields - validate dates in real-time
        if (field === 'startDate' || field === 'endDate') {
            const startDate = field === 'startDate' ? value : formData.startDate;
            const endDate = field === 'endDate' ? value : formData.endDate;
            
            // Validate dates with the new values
            validateDates(startDate, endDate);
        }
    };

    const handleSelectChange = (field: keyof CreatePromotionRequest) => (
        e: any
    ) => {
        const value = e.target.value;
        const newFormData = {
            ...formData,
            [field]: value,
        };

        setFormData(newFormData);

        // If changing discount type, validate the discount value
        if (field === 'discountType') {
            const newErrors = { ...errors };
            if (value === 'percentage' && formData.discountValue > 100) {
                newErrors.discountValue = 'Percentage discount cannot exceed 100%';
            } else if (value === 'fixed') {
                // Clear percentage-specific error when switching to fixed
                if (errors.discountValue === 'Percentage discount cannot exceed 100%') {
                    delete newErrors.discountValue;
                }
            }
            setErrors(newErrors);
        }
    };

    const handleGameSelection = (event: any) => {
        const value = event.target.value;
        // Ensure we always have an array of numbers
        const selectedIds = Array.isArray(value) ? value : [value];
        
        setFormData(prev => ({
            ...prev,
            selectedGameIds: selectedIds,
        }));

        // Clear game selection error when games are selected
        if (selectedIds.length > 0) {
            const newErrors = { ...errors };
            delete newErrors.selectedGames;
            setErrors(newErrors);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {promotion ? 'Edit Promotion' : 'Create New Promotion'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* General Error Alert */}
                        {errors.general && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.general}
                            </Alert>
                        )}
                        
                        {/* Start Date Error Alert */}
                        {errors.startDate && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.startDate}
                            </Alert>
                        )}
                        
                        {/* Date Range Error Alert */}
                        {errors.dateRange && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.dateRange}
                            </Alert>
                        )}

                        {/* Game Selection Error Alert */}
                        {errors.selectedGames && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errors.selectedGames}
                            </Alert>
                        )}

                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Promotion Code"
                                    value={formData.code}
                                    onChange={handleChange('code')}
                                    error={!!errors.code}
                                    helperText={errors.code}
                                    required
                                />
                            </Grid>
                            <Grid 
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Max Usage (Optional)"
                                    type="number"
                                    value={formData.maxUsage ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            maxUsage: value === '' ? undefined : parseInt(value)
                                        }));
                                    }}
                                    slotProps={{ htmlInput: { min: 1 } }}
                                />
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <FormControl fullWidth required>
                                    <InputLabel>Discount Type</InputLabel>
                                    <Select
                                        value={formData.discountType}
                                        label="Discount Type"
                                        onChange={handleSelectChange('discountType')}
                                    >
                                        <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label={`Discount Value ${formData.discountType === 'percentage' ? '(%)' : '($)'}`}
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={handleChange('discountValue')}
                                    slotProps={{ 
                                        htmlInput: { 
                                            min: 0, 
                                            step: 0.01,
                                            max: formData.discountType === 'percentage' ? 100 : undefined
                                        } 
                                    }}
                                    error={!!errors.discountValue}
                                    helperText={errors.discountValue}
                                    required
                                />
                            </Grid>
                            <Grid 
                                size={{
                                    xs: 12,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleChange('description')}
                                    multiline
                                    rows={3}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    required
                                />
                            </Grid>
                            <Grid 
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange('startDate')}
                                    helperText={errors.startDate || "Start date must be today or later"}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: getTodayDate() } }}
                                    required
                                />
                            </Grid>
                            <Grid 
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange('endDate')}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    required
                                />
                            </Grid>
                            <Grid 
                                size={{
                                    xs: 12,
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isActive}
                                                onChange={handleChange('isActive')}
                                            />
                                        }
                                        label="Active"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.applicableToAll}
                                                onChange={handleChange('applicableToAll')}
                                            />
                                        }
                                        label="Applicable to All"
                                    />
                                </Box>
                            </Grid>

                            {/* Game Selection Field - Only show when not applicable to all */}
                            {!formData.applicableToAll && (
                                <Grid 
                                    size={{
                                        xs: 12,
                                    }}
                                >
                                    <FormControl fullWidth error={!!errors.selectedGames}>
                                        <InputLabel>Select Games</InputLabel>
                                        <Select
                                            multiple
                                            value={formData.selectedGameIds || []}
                                            onChange={handleGameSelection}
                                            input={<OutlinedInput label="Select Games" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(selected as number[]).map((gameId) => {
                                                        const game = games.find(g => g.id === gameId);
                                                        return (
                                                            <Chip 
                                                                key={gameId} 
                                                                label={game?.title || `Game ${gameId}`}
                                                                size="small"
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                            disabled={loadingGames}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: {
                                                        maxHeight: 400,
                                                    },
                                                },
                                            }}
                                        >
                                            {loadingGames ? (
                                                <MenuItem disabled>
                                                    <em>Loading games...</em>
                                                </MenuItem>
                                            ) : games.length === 0 ? (
                                                <MenuItem disabled>
                                                    <em>No games available</em>
                                                </MenuItem>
                                            ) : (
                                                games.map((game) => {
                                                    const isSelected = (formData.selectedGameIds || []).indexOf(game.id) > -1;
                                                    const hasOtherPromotion = Boolean(game.promo_id && game.promo_id !== promotion?.id);
                                                    const hasCurrentPromotion = game.promo_id === promotion?.id;
                                                    
                                                    return (
                                                        <MenuItem 
                                                            key={game.id} 
                                                            value={game.id}
                                                            // disabled={hasOtherPromotion}
                                                            // sx={{
                                                            //     opacity: hasOtherPromotion ? 0.6 : 1,
                                                            // }}
                                                        >
                                                            <Checkbox 
                                                                checked={isSelected}
                                                                // disabled={hasOtherPromotion}
                                                            />
                                                            <ListItemText 
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <span>{game.title}</span>
                                                                        {hasCurrentPromotion && (
                                                                            <Chip 
                                                                                label="Current Promo" 
                                                                                size="small" 
                                                                                color="primary"
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                        {hasOtherPromotion && (
                                                                            <Chip 
                                                                                label={`Assigned to: ${game.promo_code || 'Other Promo'}`}
                                                                                size="small" 
                                                                                color="warning"
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                        {!game.promo_id && (
                                                                            <Chip 
                                                                                label="No Promo" 
                                                                                size="small" 
                                                                                color="default"
                                                                                variant="outlined"
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                }
                                                            />
                                                        </MenuItem>
                                                    );
                                                })
                                            )}
                                        </Select>
                                        {errors.selectedGames && (
                                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                                                {errors.selectedGames}
                                            </Box>
                                        )}
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : promotion ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PromotionFormDialog;