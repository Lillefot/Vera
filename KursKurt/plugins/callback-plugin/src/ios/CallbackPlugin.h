//
//  CallbackPlugin.h
//  KursKurt
//
//  Created by Måns on 28/06/17.
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface CallbackPlugin : CDVPlugin

- (void)echo:(CDVInvokedUrlCommand*)command;

@end
