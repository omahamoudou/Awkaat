import { COUNTER_CHANGE } from "../constants";

interface actionInterface {
    type: string,
    payload: any
}

const initialState = {
    countx: 0
}

const countReducer = (state = 0, action: actionInterface) => {
    console.log(action.payload);
    console.log("====XXXX====");
    switch (action.type) {
        case COUNTER_CHANGE:
            return action.payload
        default:
            return state;
    }
}

export default countReducer