service UserService @(
    path    : '/user',
    requires: 'any'
) {
    @cds.api.ignore
    @cds.persistence.skip
    entity userInfo {
        key ID        : String;
            firstName : String;
            lastName  : String;
            email     : String;
            companyId : String;
            company   : String;
            type      : String;
    };

    @(requires: 'authenticated-user')
    function getUserInfo() returns userInfo;
    function login()                                                 returns Boolean;
    function loginSuccess()                                          returns String;
}
