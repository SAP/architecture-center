@path: '/github'
service GitHubService {
    // @requires: 'authenticated-user'

    action fork()                                 returns {
        forkedRepoOwner : String;
        forkedRepoName  : String;
    };

    action commitDirectory(repoOwner: String,
                           repoName: String,
                           localDirectoryName: String,
                           commitMessage: String) returns {
        commitUrl : String
    };
}
