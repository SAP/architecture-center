using {DocumentService} from './document-service';

annotate DocumentService.Users with @readonly;
annotate DocumentService.Tags with @readonly;

annotate DocumentService.DocumentContributors with @restrict: [
    {
        grant: 'READ',
        where: (document.author.username = $user
        or exists document.contributors[user.username = $user])
    },
    {
        grant: 'WRITE',
        where: (document.author.username = $user)
    }
];

annotate DocumentService.DocumentTags with @restrict: [
    {
        grant: 'READ',
        where: (document.author.username = $user
        or exists document.contributors[user.username = $user])
    },
    {
        grant: 'WRITE',
        where: (document.author.username = $user)
    }
];

annotate DocumentService.DocumentAssets with @restrict: [
    {
        grant: 'READ',
        where: (document.author.username = $user
        or exists document.contributors[user.username = $user])
    },
    {
        grant: 'WRITE',
        where: (document.author.username = $user)
    }
];

annotate DocumentService.Documents with @restrict: [
    {
        grant: 'READ',
        where: (author.username = $user
        or exists contributors[user.username = $user])
    },
    {
        grant: [
            'UPDATE',
            'DELETE'
        ],
        where: (author.username = $user)
    }
];
