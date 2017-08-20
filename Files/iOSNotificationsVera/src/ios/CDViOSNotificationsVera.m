#import "CDViOSNotificationsVera.h"
#import <Cordova/CDVPlugin.h>

@implementation CDViOSNotificationsVera
- (void)pluginInitialize
{

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(finishLaunching:) name:UIApplicationDidFinishLaunchingNotification object:nil];

}

- (void)finishLaunching:(NSNotification *)notification
{
    // Put here the code that should be on the AppDelegate.m
    //Create category for notification with action buttons
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;

    UNMutableNotificationContent *content = [UNMutableNotificationContent new];


    UNNotificationAction *goodAction = [UNNotificationAction actionWithIdentifier:@"Good"
                                                                            title:@"Bra!" options:UNNotificationActionOptionNone];
    UNNotificationAction *badAction = [UNNotificationAction actionWithIdentifier:@"Bad"
                                                                           title:@"Dålig!" options: UNNotificationActionOptionNone];
    UNNotificationCategory *category = [UNNotificationCategory categoryWithIdentifier:@"Vera"
                                                                              actions:@[goodAction,badAction] intentIdentifiers:@[]
                                                                              options:UNNotificationCategoryOptionNone];
    NSSet *categories = [NSSet setWithObject:category];
    [center setNotificationCategories:categories];
    content.categoryIdentifier = @"Vera";

    NSLog((@"didFinishLaunchingWithOptions"));
}

@end
