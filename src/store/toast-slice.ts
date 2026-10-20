import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToastState {
  message: string | null;
  id: number;
}

const initialState: ToastState = { message: null, id: 0 };

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      state.id += 1;
    },
    hideToast: (state) => {
      state.message = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
