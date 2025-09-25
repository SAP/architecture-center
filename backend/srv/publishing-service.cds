service PublishingService {

    action publish(document: LargeString) returns {
        message   : String;
        commitUrl : String;
    };
}
