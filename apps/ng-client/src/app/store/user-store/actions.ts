import { Action } from '@ngrx/store';
import { UserCredentialsDto, UserDto } from '@ticketing/ng/open-api';

export enum ActionTypes {
  SIGN_UP = '[Sign up] Create User',
  SIGN_UP_SUCCESS = '[Auth API] Add SignUp Success',
  SIGN_UP_FAILURE = '[Auth API] Add SignUp Failure',

  SIGN_IN = '[Sign in] Login User',
  SIGN_IN_SUCCESS = '[Auth API] Add SignIn Success',
  SIGN_IN_FAILURE = '[Auth API] Add SignIn Failure',

  SIGN_OUT = '[Sign in] Logout User',
  SIGN_OUT_SUCCESS = '[Auth API] Add SignOut Success',
  SIGN_OUT_FAILURE = '[Auth API] Add SignOut Failure',

  LOAD_CURRENT_USER = '[Current user] Get current User',
  LOAD_CURRENT_USER_SUCCESS = '[Auth API] Get Current User Success',
  LOAD_CURRENT_USER_FAILURE = '[Auth API] Get Current User Failure',

  // UPDATE_USER = '[Details Screen] Update User',
  // UPDATE_USER_SUCCESS = '[Details Screen] Update User Success',
  // UPDATE_USER_FAILURE = '[Details Screen] Update User Failure',
}

export class SignUpAction implements Action {
  readonly type = ActionTypes.SIGN_UP;
  constructor(public payload: { credentials: UserCredentialsDto }) {}
}

export class SignUpSuccessAction implements Action {
  readonly type = ActionTypes.SIGN_UP_SUCCESS;
  constructor(public payload: { user: UserDto }) {}
}

export class SignUpFailureAction implements Action {
  readonly type = ActionTypes.SIGN_UP_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class SignInAction implements Action {
  readonly type = ActionTypes.SIGN_IN;
  constructor(public payload: { credentials: UserCredentialsDto }) {}
}

export class SignInSuccessAction implements Action {
  readonly type = ActionTypes.SIGN_IN_SUCCESS;
  constructor(public payload: { token?: string }) {}
}

export class SignInFailureAction implements Action {
  readonly type = ActionTypes.SIGN_IN_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class SignOutAction implements Action {
  readonly type = ActionTypes.SIGN_OUT;
}

export class SignOutSuccessAction implements Action {
  readonly type = ActionTypes.SIGN_OUT_SUCCESS;
}

export class SignOutFailureAction implements Action {
  readonly type = ActionTypes.SIGN_OUT_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class LoadCurrentUserAction implements Action {
  readonly type = ActionTypes.LOAD_CURRENT_USER;
}

export class LoadCurrentUserSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_CURRENT_USER_SUCCESS;
  constructor(public payload: { user: UserDto }) {}
}

export class LoadCurrentUserFailureAction implements Action {
  readonly type = ActionTypes.LOAD_CURRENT_USER_FAILURE;
  constructor(public payload: { error: string }) {}
}

// export class UpdateUserAction implements Action {
//   readonly type = ActionTypes.UPDATE_USER;
//   constructor(public payload: { userId: string; user: UpdateUserDto }) {}
// }

// export class UpdateUserSuccessAction implements Action {
//   readonly type = ActionTypes.UPDATE_USER_SUCCESS;
//   constructor(public payload: { user: Update<User> }) {}
// }

// export class UpdateUserFailureAction implements Action {
//   readonly type = ActionTypes.UPDATE_USER_FAILURE;
//   constructor(public payload: { error: string }) {}
// }

export type ActionsUnion =
  | SignUpAction
  | SignUpSuccessAction
  | SignUpFailureAction
  | SignInAction
  | SignInFailureAction
  | SignInSuccessAction
  | SignOutAction
  | SignOutFailureAction
  | SignOutSuccessAction
  | LoadCurrentUserAction
  | LoadCurrentUserSuccessAction
  | LoadCurrentUserFailureAction;
