/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdherentsAsync } from "../redux/relations/relationsSlice.js";

const AdherentAutocomplete = ({ value, onChange }) => {
  const dispatch = useDispatch();
  const { adherents, loading, error } = useSelector((state) => state.relations);

  useEffect(() => {
    dispatch(fetchAdherentsAsync());
  }, [dispatch]);

  const selectedOption = adherents.find((o) => o.id === value) || null;
  console.log(adherents);

  // Custom label formatter
  const getOptionLabel = (option) => {
    if (!option) return "";
    const typePiece = option.typePieceIdentite?.dsg || "";
    const numeroPiece = option.numeroPieceIdentite || "";
    const raisonSocial = option.raisonSocial || "";
    return `${typePiece} ${numeroPiece} - ${raisonSocial}`;
  };

  return (
    <Autocomplete
    fullWidth={true}

      options={adherents}
      loading={loading}
      getOptionLabel={getOptionLabel}
      value={selectedOption}
      onChange={(event, newValue) => onChange(newValue ? newValue.id : "")}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Sélectionner un adhérent"
          variant="outlined"
          
          error={!!error}
          helperText={error ? "Erreur lors du chargement." : ""}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AdherentAutocomplete;
