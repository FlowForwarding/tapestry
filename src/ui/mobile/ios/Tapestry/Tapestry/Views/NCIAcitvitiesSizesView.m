//
//  NCIAcitvitiesSizesView.m
//  Tapestry
//
//  Created by Ira on 5/16/14.
//  Copyright (c) 2014 FlowForwarding.Org. All rights reserved.
//

#import "NCIAcitvitiesSizesView.h"
#import "NCISimpleChartView.h"
#import "NCIBarGraphView.h"

@implementation NCIAcitvitiesSizesView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        NCISimpleChartView *barChart =  [[NCISimpleChartView alloc] initWithFrame:
                                         CGRectMake(100, 100, self.frame.size.width - 200, self.frame.size.height -200)
                                                                       andOptions:@{nciGraphRenderer: [NCIBarGraphView class]}
                                         ];
        
        [self addSubview:barChart];
        
        for (int ind = 1; ind < 10; ind ++){
            [barChart addPoint:ind val:@[@(-arc4random() % 5)]];
        }
    }
    return self;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
