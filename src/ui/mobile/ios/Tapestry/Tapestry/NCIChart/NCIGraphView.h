//
//  NCIGraphView.h
//  Tapestry
//
//  Created by Ira on 11/19/13.
//  Copyright (c) 2013 Truststix. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "NCIChartView.h"
#import "NCIGridAreaView.h"

@interface NCIGraphView : UIView

- (id)initWithChart: (NCIChartView *)chartHolder;

@property(nonatomic) float bottomChartIndent;
@property(nonatomic) float leftRightIndent;
@property(nonatomic) float topChartIndent;

@property(nonatomic, strong) NCIChartView* chart;

@property(nonatomic)float scaleIndex;
//TODO change to date, thats fast hack
@property(nonatomic)float leftShift;

@property(nonatomic)bool hasGrid;
@property(nonatomic)bool hasYLabels;

@property(nonatomic)float gridVerticalIndent;

@property(nonatomic, strong)UIScrollView *gridScroll;
@property(nonatomic, strong)NCIGridAreaView *gridArea;

@end