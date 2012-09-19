/**
 * Tree walking functions.
 *
 * prewalk(form, fn, leaf, inplace)
 *
 *     Descend into the given tree and build a new tree with the result
 *     of applying the given fn and leaf functions to each branch and leaf.
 *
 *     The given fn is applied as the tree is descended into - the
 *     function application (pre)cedes descending into the tree.
 *
 *     By default, an entirely new structure is returned. If the
 *     optional inplace argument is true, the algorithm will not
 *     allocate any new structures, but modify the given form in-place.
 *     The benefit of this is more performance due to less allocation,
 *     and reduced memory overhead.
 *
 * postwalk(form, fn, leaf, inplace)
 *
 *     The same as prewalk, except the given fn is applied as the tree
 *     is ascended.
 *
 * preprune(form, pred, leaf, inplace)
 *
 *     The same as prewalk, except fn is a predicate function and any
 *     branch or leaf that is encountered and for which pred returns
 *     true is removed from the tree.
 *
 * postprune(form, pred, leaf, inplace)
 *
 *     The same as preprune, except the predicate function is applied as
 *     the tree is ascended.
 *
 * leaves(form, leaf, inplace)
 *
 *     Shorthand for postwalk(form, Functions.identity, leaf, inplace)
 *
 * flatten(form)
 *
 *     Makes an array of all leaves in the tree.
 *
 * prepruneNodes(form, fn, leaf, inplace)
 *
 *     Like preprune() except:
 *     - the given form may be either an element or text node, but not an
 *       array or map
 *     - the default leaf function will clone leaf nodes unless inplace is true.
 *
 *       This is different from prewalk, where the leaf function is always
 *       the identity function, because an array or map can be the child of
 *       multiple arrays and hashmaps at the same time, while a node can only
 *       be the child of a single parent node at any one time.
 *   
 *       The given fn, and the optional leaf function (if given), should
 *       also return a new node, unless inplace is true.
 *
 * postpruneNodes(form, fn, leaf, inplace)
 *
 *     Like prepruneNodes(), except the given function is applied as the tree
 *     is ascended.
 *
 * Note: if the fn and leaf functions modify the parent or any ancestor
 *       of the passed form, the resulting behaviour is undefined. Only
 *       modification of the passed form and descendants of the passed
 *       form is valid.
 *
 * Note: the algorithms are recursive and the maximum nesting level of
 *       the input set is therefore bound to the maximum stack depth.
 *       IE7 and IE8 for example have a maximum stack depth of greater
 *       than 1000, so the maximum input nesting level should not exceed
 *       about 300 (3 stack frames are needed per nesting level).
 */
define(['jquery', 'util/functions'],function($, Functions){
	'use strict';

	function walk(form, recurse, leaf, inplace) {
		var type = $.type(form),
		    result,
		    resultOff,
		    len,
		    i,
		    key;
		if ('array' === type) {
			result = (inplace ? form : []);
			resultOff = 0;
			for (i = 0, len = form.length; i < len; i++) {
				if (recurse(form[i], resultOff, result)) {
					resultOff += 1;
				}
			}
			if (resultOff !== result.length) {
				// TODO is result.length = resultOff better?
				result = result.slice(0, resultOff);
			}
		} else if ('object' === type) {
			result = (inplace ? form : {});
			for (key in form) {
				if (form.hasOwnProperty(key)) {
					if (!recurse(form[key], key, result)) {
						delete result[key];
					}
				}
			}
		} else {
			result = leaf(form);
		}
		return result;
	}
	
	function walkNodes(form, recurseFn, leafFn, inplace) {
		var result,
		    subResult,
		    child,
		    nextChild;
		if (1 === form.nodeType) {
			result = inplace ? form : form.cloneNode(false);
			subResult = [];
			child = form.firstChild;
			while (child) {
				nextChild = child.nextSibling;
				if (recurseFn(child, 0, subResult)) {
					if (inplace) {
						result.replaceChild(subResult[0], child);
					} else {
						result.appendChild(subResult[0]);
					}
				} else {
					if (inplace) {
						result.removeChild(child);
					}
				}
				child = nextChild;
			}
		} else {
			result = leafFn(form);
		}
		return result;
	}

	function prewalk(form, fn, leaf, recurse, key, result, walk, inplace) {
		result[key] = walk(
			fn(form),
			recurse,
			leaf,
			inplace
		);
		return true;
	}

	function postwalk(form, fn, leaf, recurse, key, result, walk, inplace) {
		result[key] = fn(walk(
			form,
			recurse,
			leaf,
			inplace
		));
		return true;
	}

	function preprune(form, fn, leaf, recurse, key, result, walk, inplace) {
		if (!fn(form)) {
			result[key] = walk(
				form,
				recurse,
				leaf,
				inplace
			);
			return true;
		}
	}

	function postprune(form, fn, leaf, recurse, key, result, walk, inplace) {
		var subForm = walk(
			form,
			recurse,
			leaf,
			inplace
		);
		if (!fn(subForm)) {
			result[key] = subForm;
			return true;
		}
	}

	function walkrec(form, fn, leaf, walkFn, walk, inplace) {
		var result = [null];
		(function recurse(subForm, key, result) {
			return walkFn(subForm, fn, leaf, recurse, key, result, walk, inplace);
		}(form, 0, result));
		return result[0];
	}

	function cloneNode(node) {
		return node.cloneNode(true);
	}

	function _prewalk(form, fn, leaf, inplace         ) { return walkrec(form,   fn, leaf || Functions.identity, prewalk  , walk, inplace); }
	function _postwalk(form, fn, leaf, inplace        ) { return walkrec(form,   fn, leaf || Functions.identity, postwalk , walk, inplace); }
	function _preprune(form, pred, leaf, inplace      ) { return walkrec(form, pred, leaf || Functions.identity, preprune , walk, inplace); }
	function _postprune(form, pred, leaf, inplace     ) { return walkrec(form, pred, leaf || Functions.identity, postprune, walk, inplace); }
	function _prewalkNodes(form, fn, leaf, inplace    ) { return walkrec(form,   fn, leaf || (inplace ? Functions.identity : cloneNode), prewalk  , walkNodes, inplace); }
	function _postwalkNodes(form, fn, leaf, inplace   ) { return walkrec(form,   fn, leaf || (inplace ? Functions.identity : cloneNode), postwalk , walkNodes, inplace); }
	function _prepruneNodes(form, pred, leaf, inplace ) { return walkrec(form, pred, leaf || (inplace ? Functions.identity : cloneNode), preprune , walkNodes, inplace); }
	function _postpruneNodes(form, pred, leaf, inplace) { return walkrec(form, pred, leaf || (inplace ? Functions.identity : cloneNode), postprune, walkNodes, inplace); }

	function leaves(form, leaf, inplace ) { return _postwalk(form, Functions.identity, leaf, inplace); }
	function clone(form                 ) { return _postwalk(form, Functions.identity); }

	function flatten(form) {
		var inplace = true;
		var result = [];
		leaves(form, function(leaf){ result.push(leaf); return leaf; }, inplace);
		return result;
	}

	return {
		prewalk: _prewalk,
		postwalk: _postwalk,
		preprune: _preprune,
		postprune: _postprune,
		prewalkNodes: _prewalkNodes,
		postwalkNodes: _postwalkNodes,
		prepruneNodes: _prepruneNodes,
		postpruneNodes: _postpruneNodes,
		leaves: leaves,
		clone: clone,
		flatten: flatten
	};
});
