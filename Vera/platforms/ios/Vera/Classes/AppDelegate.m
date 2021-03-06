/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.m
//  Vera
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "AppDelegate.h"
#import "MainViewController.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    self.viewController = [[MainViewController alloc] init];
    
    //Create category for notification with action buttons
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    
    UNMutableNotificationContent *content = [UNMutableNotificationContent new];
    
    
    UNNotificationAction *goodAction = [UNNotificationAction actionWithIdentifier:@"Good"
                                                                            title:@"Ja" options:UNNotificationActionOptionNone];
    UNNotificationAction *badAction = [UNNotificationAction actionWithIdentifier:@"Bad"
                                                                           title:@"Nej" options: UNNotificationActionOptionNone];
    UNNotificationCategory *category = [UNNotificationCategory categoryWithIdentifier:@"Vera"
                                                                              actions:@[goodAction,badAction] intentIdentifiers:@[]
                                                                              options:UNNotificationCategoryOptionNone];
    NSSet *categories = [NSSet setWithObject:category];
    [center setNotificationCategories:categories];
    content.categoryIdentifier = @"Vera";
    
    NSLog((@"didFinishLaunchingWithOptions"));
    
    
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

//Lets the app run JS in the background on notification response
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)())completionHandler{
    
    UIWebView * webView = (UIWebView *) self.viewController.webView;
    
    NSString *jsSetLectureName = @"setLectureName('');";
    NSString *title = response.notification.request.content.title;
    NSMutableString *jsSetLectureNameWithTitle = [NSMutableString stringWithString:jsSetLectureName];
    [jsSetLectureNameWithTitle insertString:title atIndex:16];
    NSLog(@"%@", jsSetLectureNameWithTitle);
    [webView stringByEvaluatingJavaScriptFromString:jsSetLectureNameWithTitle];
    
    NSString *jsFunction = @"submitFormFromLockScreen('');";
    NSString *userChoice = response.actionIdentifier;
    NSMutableString *jsFunctionWithChoice = [NSMutableString stringWithString:jsFunction];
    [jsFunctionWithChoice insertString:userChoice atIndex:26];
    NSLog(@"%@", jsFunctionWithChoice);
    
    
    [webView stringByEvaluatingJavaScriptFromString:jsFunctionWithChoice];
    
    //Called to let your app know which action was selected by the user for a given notification.
    NSLog((@"didReceiveNotifiacitonResponse"));
    NSLog(@"ActionButtonPressed %@",response.actionIdentifier);
    NSLog(@"Title %@", response.notification.request.content.title);
    completionHandler();
}


@end
