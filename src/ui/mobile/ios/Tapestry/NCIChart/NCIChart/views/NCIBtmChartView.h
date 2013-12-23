//
//  NCIBtmChartView.h
//  NCIChart
//
//  Created by Ira on 12/22/13.
//  Copyright (c) 2013 FlowForwarding.Org. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NCISimpleChartView.h"
@class NCIChartView;

@interface NCIBtmChartView : NCISimpleChartView

- (void)redrawRanges;

@property(nonatomic, strong) NCIChartView* nciChart;

@end