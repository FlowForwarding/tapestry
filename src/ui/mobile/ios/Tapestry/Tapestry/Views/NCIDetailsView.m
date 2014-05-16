//
//  NCIDetailsView.m
//  Tapestry
//
//  Created by Ira on 5/16/14.
//  Copyright (c) 2014 FlowForwarding.Org. All rights reserved.
//

#import "NCIDetailsView.h"

@interface NCIDetailsView(){

}
@end

@implementation NCIDetailsView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {

        float buttonWidth = frame.size.width/5;
        float buttonHeight = 50;
        UIColor *btnColor = [UIColor colorWithRed:95/255.0 green:116/255.0 blue:126/255.0 alpha:1];
        UIButton *flowsButton = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, buttonWidth, buttonHeight)];
        [flowsButton setTitle:@"Flows" forState:UIControlStateNormal];
        flowsButton.backgroundColor = btnColor;
        [self.content addSubview:flowsButton];
        
        UIButton *activitiesButton = [[UIButton alloc] initWithFrame:CGRectMake(buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesButton setTitle:@"Activities" forState:UIControlStateNormal];
        activitiesButton.backgroundColor = btnColor;
        [self.content addSubview:activitiesButton];
        
        UIButton *activitiesPrettyButton = [[UIButton alloc] initWithFrame:CGRectMake(2*buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesPrettyButton setTitle:@"Activities(Pretty)" forState:UIControlStateNormal];
        activitiesPrettyButton.backgroundColor = btnColor;
        [self.content addSubview:activitiesPrettyButton];
        
        UIButton *internalNetworkButton = [[UIButton alloc] initWithFrame:CGRectMake(3*buttonWidth, 0, buttonWidth, buttonHeight)];
        [internalNetworkButton setTitle:@"Internal Network" forState:UIControlStateNormal];
        internalNetworkButton.backgroundColor = btnColor;
        [self.content addSubview:internalNetworkButton];
        
        UIButton *activitiesSizesButton = [[UIButton alloc] initWithFrame:CGRectMake(4*buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesSizesButton setTitle:@"Activities Sizes" forState:UIControlStateNormal];
        activitiesSizesButton.backgroundColor = btnColor;
        [self.content addSubview:activitiesSizesButton];
        
    }
    return self;
}


@end
