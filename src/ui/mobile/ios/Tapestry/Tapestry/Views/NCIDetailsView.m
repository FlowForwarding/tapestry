//
//  NCIDetailsView.m
//  Tapestry
//
//  Created by Ira on 5/16/14.
//  Copyright (c) 2014 FlowForwarding.Org. All rights reserved.
//

#import "NCIDetailsView.h"

@interface NCIDetailsView()<UIScrollViewDelegate>{
    UIView *content;
}
@end

@implementation NCIDetailsView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        self.contentSize = CGSizeMake(self.frame.size.width, self.frame.size.height*2);
        content = [[UIView alloc] initWithFrame:CGRectMake(0, self.frame.size.height, self.frame.size.width, self.frame.size.height)];
        [self addSubview:content];
        content.backgroundColor = [UIColor whiteColor];
        self.pagingEnabled = YES;
        self.delegate = self;
        self.showsVerticalScrollIndicator = NO;
        float buttonWidth = frame.size.width/5;
        float buttonHeight = 50;
        UIColor *btnColor = [UIColor colorWithRed:95/255.0 green:116/255.0 blue:126/255.0 alpha:1];
        UIButton *flowsButton = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, buttonWidth, buttonHeight)];
        [flowsButton setTitle:@"Flows" forState:UIControlStateNormal];
        flowsButton.backgroundColor = btnColor;
        [content addSubview:flowsButton];
        
        UIButton *activitiesButton = [[UIButton alloc] initWithFrame:CGRectMake(buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesButton setTitle:@"Activities" forState:UIControlStateNormal];
        activitiesButton.backgroundColor = btnColor;
        [content addSubview:activitiesButton];
        
        UIButton *activitiesPrettyButton = [[UIButton alloc] initWithFrame:CGRectMake(2*buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesPrettyButton setTitle:@"Activities(Pretty)" forState:UIControlStateNormal];
        activitiesPrettyButton.backgroundColor = btnColor;
        [content addSubview:activitiesPrettyButton];
        
        UIButton *internalNetworkButton = [[UIButton alloc] initWithFrame:CGRectMake(3*buttonWidth, 0, buttonWidth, buttonHeight)];
        [internalNetworkButton setTitle:@"Internal Network" forState:UIControlStateNormal];
        internalNetworkButton.backgroundColor = btnColor;
        [content addSubview:internalNetworkButton];
        
        UIButton *activitiesSizesButton = [[UIButton alloc] initWithFrame:CGRectMake(4*buttonWidth, 0, buttonWidth, buttonHeight)];
        [activitiesSizesButton setTitle:@"Activities Sizes" forState:UIControlStateNormal];
        activitiesSizesButton.backgroundColor = btnColor;
        [content addSubview:activitiesSizesButton];
        
        //Flows //Activities //Activities(Pretty) //Internal Network //Activities Sizes
    }
    return self;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView{
    if (scrollView.contentOffset.y <= 0){
        self.center = CGPointMake(self.center.x, -self.frame.size.height/2);
    }
}

@end
