/* eslint-disable no-unused-vars */
import {combineReducers,configureStore} from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import userReducer from "./user/userSlice";
import usersReducer from "./user/usersSlice";
import modeReducer from "./mode/modeSlice";
import ppReducer from "./personne/PersonnePhysiqueSlice";
import pmReducer from "./personne/PersonneMoraleSlice.js";
import formReducer from "./formSteperSlice/FormSlice";
import contratReducer from "./contrat/ContratSlice";
import relationsReducer from "./relations/relationsSlice.js"
import factureReducer from "./facture/FactureSlice.js"
import traiteReducer from "./traite/traiteSlice.js"
import demFinReducer from "./demFin/demFinSlice.js"
import enqueteReducer from "./enquete/enqueteSlice.js";
import accordReducer from "./accord/accordSlice.js";
import mereFilialeReducer from "./MereFiliale/MereFilialeSlice.js";
import blackListReducer from "./blackList/blackListSlice.js";
import ribReducer from "./rib/ribSlice.js";
import {persistReducer,persistStore} from "redux-persist";
import {createTransform} from "redux-persist";

const EXPIRATION_TIME = 2 * 24 * 60 * 60 * 1000;
// const EXPIRATION_TIME =10000;

const expireTransform = createTransform(
    // Transform inbound state (before persisting)
    (inboundState, key) => {
        return {
            ...inboundState,
            _persistedAt: Date.now(), // Add a timestamp
        };
    },
    // Transform outbound state (when rehydrating)
    (outboundState, key) => {
        if (!outboundState?._persistedAt) {
            return outboundState;
        }

        const currentTime = Date.now();
        const persistedAt = outboundState._persistedAt;

        // Check if data has expired
        if (currentTime - persistedAt > EXPIRATION_TIME) {
            console.log("State expired for key:", key);
            return undefined; // Clear expired state
        }

        return outboundState;
    },
    // Transform configuration
    { whitelist: ["user","mode"] } // Apply only to the `user` slice
);

const rootReducer = combineReducers({
    user:userReducer,
    users:usersReducer,
    mode:modeReducer,
    personnePhysique:ppReducer,
    personneMorale:pmReducer,
    form:formReducer,
    contrat:contratReducer,
    relations:relationsReducer,
    facture:factureReducer,
    traite:traiteReducer,
    demFin:demFinReducer,
    enquete:enqueteReducer,
    accord:accordReducer,
    mereFiliale:mereFilialeReducer,
    blackList:blackListReducer,
    rib:ribReducer,
});

const persistConfig = {
    key: "root",
    storage,
    version: 1,
    transforms: [expireTransform],// Add the transform
    whitelist:["user","mode"],
};
const persistedReducer = persistReducer(persistConfig,rootReducer);

export const store = configureStore({
    reducer:persistedReducer,
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
        serializableCheck:false,
    }),
});

export const persistor = persistStore(store);