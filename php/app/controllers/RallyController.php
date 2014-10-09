<?php

class RallyController extends BaseController
{

    public function login()
    {
        try {
            if (!Session::get('RallyUserName')) {
                $input = Input::all();
                $validator = Validator::make(
                        $input, array(
                        'username' => 'required|email',
                        'password' => 'required'
                        )
                );
                if ($validator->fails()) {
                    throw new Exception($validator->messages());
                }
                $rally = new Rally($input['username'], $input['password']);
                Session::put('RallyUserName', $input['username']);
            }
            $user = new User;
            $user->name = Session::get('RallyUserName');
            return Response::json(array("status" => 1, "message" => "", "user" => $user));
        } catch (Exception $ex) {
            return Response::json(array("status" => 0, "message" => $ex->getMessage()));
        }
    }
    
    public function logout(){
        Session::forget('RallyUserName');
        return Response::json(array("status" => 1, "message" => "Logout Successfully."));
    }

}
